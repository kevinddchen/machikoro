import React, { useState } from "react";
import ReactDOM from "react-dom";
//import './index.css';
//import App from './App';
import { LobbyClient } from "boardgame.io/client";
import { Client } from "boardgame.io/react";
import { Local, SocketIO } from "boardgame.io/multiplayer"
import { TicTacToe } from "./Game";
import { TicTacToeBoard } from "./Board";

// --- SETUP ------------------------------------------------------------------

const port = process.env.PORT || 80;
const serverOrigin = `${window.location.protocol}//${window.location.hostname}:${port}`;

// Set-up lobby
const lobbyClient = new LobbyClient({ server: serverOrigin });
console.log("Created lobby.");
lobbyClient.listMatches("tic-tac-toe").then( function({ matches }) {
  console.log("Number of open games: %d.", matches.length);
});

// ----------------------------------------------------------------------------

const copyToClipboard = () => {
  var text = document.getElementById("copytext");
  text.select();
  document.execCommand("copy");
  console.log(text);
}

const TicTacToeClient = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  numPlayers: 2,
  multiplayer: SocketIO({ server: serverOrigin }),
});

const App = () => {
  // Hooks
  const [inputName, setInputName] = useState("");
  const [inputMatchID, setInputMatchID] = useState("");
  const [roomMatchID, setRoomMatchID] = useState("");
  const [playerID, setPlayerID] = useState("");
  const [credentials, setCredentials] = useState("");
  const [errMsg, setErrMsg] = useState(""); // Any error messages to display
  const [state, setState] = useState(0); // 0 means free, 1 means in room, 2 means in game

  const createMatch = async () => {
    // Create a match and join.
    const { matchID } = await lobbyClient.createMatch("tic-tac-toe", {
      numPlayers: 2,
    });
    console.log("Created match with ID: %s.", matchID);
    joinMatch(inputName, matchID);
  }

  const joinMatch = async (name, matchID) => {
    // Join a match with your name and the matchID.
    let match
    try {
      match = await lobbyClient.getMatch("tic-tac-toe", matchID);
    } catch {
      setErrMsg("Cannot join: Match ID is invalid.");
      return;
    }
    console.log("Joining match '%s' as '%s'...", matchID, name);
    // find free seat
    let seat;
    for (let i=0; i<match.players.length; i++) {
      const x = match.players[i];
      if ("name" in x) {
        if (x.name === name) {
          setErrMsg("Cannot join: Name already taken.");
          return;
        }
      } else if (seat === undefined) {
        seat = i.toString();
      }
    }
    if (seat === undefined) {
      setErrMsg("Cannot join: No free seats available.");
      return;
    }
    console.log("...found empty seat %s...", seat);
    const { playerCredentials } = await lobbyClient.joinMatch(
      "tic-tac-toe",
      matchID,
      {
        playerID: seat,
        playerName: name,
      }
    );
    console.log("...received credentials...");
    setRoomMatchID(matchID)
    setPlayerID(seat);
    setCredentials(playerCredentials)
    setState(1);
    setErrMsg("");
    console.log("Success!");
  }

  const leaveMatch = async () => {
    // Leave the match.
    await lobbyClient.leaveMatch("tic-tac-toe", roomMatchID, {
      playerID: playerID,
      credentials: credentials,
    });
    setRoomMatchID("");
    setPlayerID("");
    setCredentials("")
    setState(0);
    console.log("Left match.")
  }

  if (state === 2) {
    return (
      <TicTacToeClient 
        matchID={roomMatchID}
        playerID={playerID}
        credentials={credentials}
      />
    )
  } else {
    return (
      <div>
        {/* Show lobby. */}
        <p>Name: &nbsp;
          <input
            type="text"
            maxLength={16}
            spellCheck="false"
            autoComplete="off"
            onChange={(e) => setInputName(e.target.value)}
            disabled={state !== 0}
          />
        </p>
        <p>
          <button onClick={createMatch} disabled={inputName.length ===0 || state !== 0}>
              Create Match
          </button>
          &nbsp; or &nbsp;
          <button onClick={() => joinMatch(inputName, inputMatchID)} 
                  disabled={inputName.length === 0 || inputMatchID.length !== 11 || state !== 0} >
              Join Match
          </button>
          &nbsp; with ID: &nbsp;
          <input
            type="text"
            maxLength={11}
            spellCheck="false"
            autoComplete="off"
            onChange={(e) => setInputMatchID(e.target.value)}
            disabled={state !== 0}
          /> 
        </p>
        <p style={{ color: "red" }}>{errMsg}</p>
        {/* If in a room, show additional info. */}
        { state === 1 ? (
          <div>
            <hr></hr>
            <p id="test">Joined Match ID: &nbsp;
              <input
                id="copytext"
                type="text"
                value={roomMatchID}
                spellCheck="false"
                readOnly
              />
              <input 
                type="image"
                src="assets/copy.png"
                height="16px"
                onClick={copyToClipboard}
              />
            </p>
            <button onClick={leaveMatch}>
              Leave
            </button>
            <button onClick={() => setState(2)}>
              Start
            </button>
          </div>
        ) : null
        }
      </div>
    );
  }
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
