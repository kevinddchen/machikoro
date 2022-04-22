import './styles/main.css';
import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Machikoro } from './game/Game';  // core game logic
import Matchmaker from './lobby/Matchmaker';  // handles matchmaking
import MachikoroBoard  from './game/Board';  // handles game
import { PORT, IN_PROD } from './config';


/**
 * Main web app. Switches between `Matchmaker`, which manages the game lobby
 * and waiting room, and `MachikoroClient`, which manages the game itself.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: '',  // these are populated when we are in a room / match
      playerID: '',
      credentials: '',
      play: false,
    };
    this.serverOrigin = `${window.location.protocol}//${window.location.hostname}:${PORT}`;
  }

  setMatchInfo = (matchID, playerID, credentials) => {
    this.setState({ matchID, playerID, credentials });
  };

  clearMatchInfo = () => {
    this.setState({ matchID: '', playerID: '', credentials: '' });
  };

  startMatch = () => this.setState({play: true});

  startDebug = () => {
    this.clearMatchInfo();
    this.startMatch();
  }

  // --- Render ----------------------------------------------------------------

  render() {
    const { matchID, playerID, credentials, play } = this.state;

    if (play) {

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
          { !IN_PROD ? // only show debug button in development
            <div className="padded_div">
              <button onClick={this.startDebug}>DEBUG</button>
            </div>
            : 
            null
          }
          <div className="title">MACHI KORO</div>
          <Matchmaker 
            serverOrigin={this.serverOrigin}
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            setMatchInfo={this.setMatchInfo}
            clearMatchInfo={this.clearMatchInfo}
            startMatch={this.startMatch}/>
          <footer className="footer">
            <a href="https://github.com/kevinddchen/machikoro" target="_blank"
             rel="noreferrer"><img src="./GitHub-Mark-Light-32px.png" alt="GitHub logo"/></a>
          </footer>
        </div>

      );

    }
  }
}

export default App;
