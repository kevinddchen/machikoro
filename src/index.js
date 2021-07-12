import React, { useState } from 'react';
import ReactDOM from 'react-dom';
//import './index.css';
//import App from './App';
import { LobbyClient } from 'boardgame.io/client';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { TicTacToe } from './Game';
import { TicTacToeBoard } from './Board';

// const TicTacToeClient = Client({
//   game: TicTacToe,
//   board: TicTacToeBoard,
//   //multiplayer: SocketIO({ server: 'localhost:8000' }),
//   debug: true,
// });

// Set-up lobby
const lobbyClient = new LobbyClient({ server: `${window.location.protocol}//${window.location.hostname}:8000` });
console.log("Created lobby.");
console.log(lobbyClient);
lobbyClient.listGames()
  .then(console.log)
  .catch(console.error);
  
lobbyClient.listMatches('tic-tac-toe').then( function({ matches }) {
  console.log("Number of matches: %d.", matches.length);
});

const App = () => {
  // Hooks
  const [inputName, setInputName] = useState("");
  const [inputMatchID, setInputMatchID] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [state, setState] = useState(0); // 0 means free, 1 means in room, 2 means in game

  // Variables
  // var name;
  // var matchID;
  // var credentials;


  const createMatch = async () => {
    const { matchID } = await lobbyClient.createMatch('tic-tac-toe', {
      numPlayers: 2,
    });
    console.log("Created match with ID: %s.", matchID);
    joinMatch(inputName, matchID);
  };

  const joinMatch = async (name, matchID) => {
    console.log("Joining match '%s' with name '%s'.", matchID, name);
    const match = await lobbyClient.getMatch('tic-tac-toe', matchID);
    const freeID = match.players.findIndex( x => !("name" in x));
    console.log("... found empty seat %d.", freeID);
    const { playerCredentials } = await lobbyClient.joinMatch(
      'tic-tac-toe',
      matchID,
      {
        playerID: freeID.toString(),
        playerName: name,
      }
    );
    console.log("... received credentials: %s.", playerCredentials);
    setState(1);
    console.log("Success!");
  }

  return (
    <div>
      {/* Show lobby. */}
      <p>Lobby</p>
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
      {/* If in a game, show additional info. */}
      { state === 1 ? (
        <div>
          <p id="test">Game Made!</p>
          <button onClick={() => setState(0)}>
              Leave
          </button>
        </div>
      ) : null
      }
      <p>{errMsg}</p>
      
    </div>
  )
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
