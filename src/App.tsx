import 'styles/main.css';

import React from 'react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';

import { MachikoroBoard }  from 'board';
import { PORT, IN_PROD } from 'config';
import { Machikoro } from 'game';
import { ClientInfo, Matchmaker } from 'lobby';

const defaultClientInfo: ClientInfo = {
  matchID: '',
  playerID: '',
  credentials: '',
};

/**
 * @param play If true, start the game.
 */
interface AppState extends ClientInfo {
  play: boolean;
}

/**
 * Create Machi Koro application.
 */
class App extends React.Component<{}, AppState> {

  // URL and port of the server.
  private serverOrigin: string;

  constructor(props: any) {
    super(props);
    this.state = {
      ...defaultClientInfo,
      play: false,
    };
    this.serverOrigin = `${window.location.protocol}//${window.location.hostname}:${PORT}`;
  }

  setClientInfo = (clientInfo: ClientInfo) => {
    this.setState(clientInfo);
  };

  clearClientInfo = () => {
    this.setState(defaultClientInfo);
  };

  startMatch = () => this.setState({ play: true });

  startDebug = () => {
    this.clearClientInfo();
    this.startMatch();
  };

  // --- Render ---------------------------------------------------------------

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
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            serverOrigin={this.serverOrigin}
            setClientInfo={this.setClientInfo}
            clearClientInfo={this.clearClientInfo}
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
