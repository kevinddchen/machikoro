import './App.css';
import React from "react";
import Matchmaker from './matchmaking/Matchmaker';
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer"
import { Machikoro } from "./game/Game";
import MachikoroBoard  from "./game/Board";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: '',
      playerID: '',
      credentials: '',
      debug: false,
    };
    const port = process.env.PORT || 80;
    this.serverOrigin = `${window.location.protocol}//${window.location.hostname}:${port}`;
  }

  startMatch = (matchID, playerID, credentials) => {
    this.setState({ matchID, playerID, credentials });
  };

  startDebug = () => process.env.NODE_ENV === 'development' && this.setState({debug: true});

  componentDidMount() {
    console.log(`env: ${process.env.NODE_ENV}.`);
  }

  render() {
    const { matchID, playerID, credentials, debug } = this.state;

    if (matchID || debug) {

      const MachikoroClient = Client({
        game: Machikoro,
        board: MachikoroBoard,
        multiplayer: SocketIO({ server: this.serverOrigin }),
      });

      return (
        <MachikoroClient
          matchID={matchID}
          playerID={playerID}
          credentials={credentials}/>
      );

    } else {
    
      return (
        <div>
          { process.env.NODE_ENV === 'development' ?
            <div className="padded_div">
              <button onClick={this.startDebug}>
                DEBUG
              </button>
            </div>
            : 
            null
          }
          <div className="title">
            Machikoro
          </div>
          <Matchmaker 
            serverOrigin={this.serverOrigin}
            start={this.startMatch}/>
        </div>
      );

    }
  }
}

export default App;
