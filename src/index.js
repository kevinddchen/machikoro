import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import './index.css';
import { LobbyClient } from "boardgame.io/client";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer"
import { Machikoro } from "./Game";
import { MachikoroBoard } from "./Board";

/** 
 * Things to do:
 * 
 * IMPORTANT
 * - Add end game
 * - Implement variable supply
 * - Implement Harbor expansion
 * 
 * OPTIONAL
 * - Add info window
 * - Optimize log
 * - Allow page refresh
 */

// --- Setup ------------------------------------------------------------------

const port = process.env.PORT || 80;
const serverOrigin = `${window.location.protocol}//${window.location.hostname}:${port}`;
const gameName = "machikoro";

console.log("Env: %s", process.env.NODE_ENV);

// lobby client
const lobbyClient = new LobbyClient({ server: serverOrigin });
console.log("Created lobby.");

const MachikoroClient = Client({
  game: Machikoro,
  board: MachikoroBoard,
  multiplayer: SocketIO({ server: serverOrigin }),
});

// --- App --------------------------------------------------------------------

/**
 * Improved setInterval: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
 function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const App = () => {

  // Hooks
  const [hNumPlayers, setNumPlayers] = useState(4);
  const [hName, setName] = useState("");
  const [hMatchID, setMatchID] = useState("");
  const [hPlayerID, setPlayerID] = useState("");
  const [hCredentials, setCredentials] = useState("");

  const [errorMessage, setErrorMessage] = useState(""); // Any error messages to display
  const [state, setState] = useState(0); // 0 means free, 1 means in room, 2 means in game

  const defaultLobbyBody = "";
  const [lobbyBody, setLobbyBody] = useState(defaultLobbyBody);
  const defaultRoomBody = "";
  const [roomBody, setRoomBody] = useState(defaultRoomBody);

  // --- Match Management -----------------------------------------------------

  /**
   * Create a match and join.
   */
  const createMatch = async () => {
    if (hName.length === 0) {
      setErrorMessage("Please enter a name.");
      return;
    }
    try {
      const { matchID } = await lobbyClient.createMatch(gameName, {numPlayers: hNumPlayers});
      console.log("Created match ID '%s'.", matchID);
      joinMatch(hName, matchID);
    } catch(e) {
      console.error(e);
    }
    
  }

  /**
   * Try to join a match.
   */
  const joinMatch = async (name, matchID) => {
    if (hName.length === 0) {
      setErrorMessage("Please enter a name.");
      return;
    }
    try {
      const match = await lobbyClient.getMatch(gameName, matchID);
      console.log("Trying to join match '%s'...", matchID);

      // find a free seat
      let seat;
      for (let i=match.players.length-1; i>=0; i--) {
        if ("name" in match.players[i]) {
          if (match.players[i].name === name) {
            setErrorMessage("Name already taken.");
            return;
          }
        } else {
          seat = i.toString();
        }
      }
      if (seat === undefined) {
        setErrorMessage("No free seats available.");
        return;
      }

      // join game
      console.log("...found seat %s...", seat)
      const { playerCredentials } = await lobbyClient.joinMatch(
        gameName,
        matchID,
        {
          playerID: seat,
          playerName: name,
        }
      );
      setMatchID(matchID);
      setPlayerID(seat);
      setCredentials(playerCredentials);
      setErrorMessage("");
      setRoomBody(defaultRoomBody);
      setState(1);
      console.log("Success!");
    } catch(e) {
      console.error(e);
    }
  }

  /**
   * Leave a match.
   */
  const leaveMatch = async () => {
    try {
      await lobbyClient.leaveMatch(gameName, hMatchID, {
        playerID: hPlayerID,
        credentials: hCredentials,
      });
      setMatchID("");
      setPlayerID("");
      setCredentials("");
      setErrorMessage("");
      setLobbyBody(defaultLobbyBody);
      setState(0);
      console.log("Left match.")
    } catch(e) {
      console.error(e);
    }
  }

  const startMatch = async () => {
    try {
      const match = await lobbyClient.getMatch(gameName, hMatchID);
      let count = 0;
      match.players.map( x => { if ("name" in x) count += 1 });
      if (count === match.players.length){
        setState(2);
      } else {
        setErrorMessage("Room not full.");
      }
    } catch(e) {
      console.error(e);
    }
  }

  const debug = async () => {
    setState(2);
  }

  // --- Lobby Management -----------------------------------------------------

  const update = async () => {
    try {
      if (state === 0) {
        const { matches } = await lobbyClient.listMatches(gameName);
        updateLobbyBody(matches);
      } else if (state === 1) {
        const match = await lobbyClient.getMatch(gameName, hMatchID);
        updateRoomBody(match);
      }
    } catch(e) {
      console.error(e);
    }
  }
  
  useInterval(update, 100);

  const updateLobbyBody = (matches) => {
    const tbody = [];
    if (matches.length === 0) {
      tbody.push(
        <tr><td>No open matches.</td></tr>
      );
    } else {
      tbody.push(
        <tr key="head">
          <th>Match ID</th>
          <th>Seats</th>
        </tr>
      );
      for (let i=0; i<matches.length; i++) {
        let count = 0;
        matches[i].players.map( x => { if ("name" in x) count += 1 });
        tbody.push(
          <tr key={i}>
            <td>{matches[i].matchID}</td>
            <td>{count}/{matches[i].players.length}</td>
            <td>
              <button onClick={() => joinMatch(hName, matches[i].matchID)} disabled={state !== 0}>Join</button>
            </td>
          </tr>
        );
      }
    }
    setLobbyBody(tbody);
  }

  const updateRoomBody = (match) => {
    const tbody = [
      <tr key="head">
        <th>Seat</th>
        <th>Player</th>
      </tr>
    ];
    for (let i=0; i<match.players.length; i++) {
      tbody.push(
        <tr key={i}>
          <td>{match.players[i].id}</td>
          <td>{match.players[i].name}</td>
        </tr>
      );
    }
    setRoomBody(tbody);
  }

  // --- Render ---------------------------------------------------------------

  if (state === 0) {
    // Show lobby
    return (
      <div>
        <p>
          Name:&nbsp;
          <input
            type="text"
            value={hName}
            maxLength={16}
            spellCheck="false"
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
          />
          &nbsp;
          {(process.env.NODE_ENV === "development") ? 
            <button onClick={debug}>Debug</button>
            : null}
        </p>
        <p>
          <button onClick={createMatch}>Create Match</button>
          &nbsp;Players:&nbsp;
          <select 
            defaultValue={hNumPlayers}
            onChange={(e) => setNumPlayers(parseInt(e.target.value))}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </p>
        <table cellPadding="3px"><tbody>{lobbyBody}</tbody></table>
        <p style={{ color: "red" }}>{errorMessage}</p>
        <hr></hr>
        <p>Important:</p>
        <ul>
          <li>Do not refresh the page!</li>
          <li>Use http, not https.</li>
          <li>End game has not been implemented yet.</li>
        </ul>
      </div>
    );
  } else if (state === 1) {
    // Show room
    return (
      <div>
        <p>Match ID: {hMatchID}</p>
        <p>
          <button onClick={leaveMatch}>Leave</button>
          &nbsp;
          <button onClick={startMatch}>Start</button>
        </p>
        <table cellPadding="3px"><tbody>{roomBody}</tbody></table>
        <p style={{ color: "red" }}>{errorMessage}</p>
      </div>
    );
  } else if (state === 2) {
    // Show game
    return (
      <MachikoroClient 
        matchID={hMatchID}
        playerID={hPlayerID}
        credentials={hCredentials}
      />
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);
