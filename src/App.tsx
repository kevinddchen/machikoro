import 'styles/main.css';

import { Client } from 'boardgame.io/react';
import React from 'react';
import { SocketIO } from 'boardgame.io/multiplayer';

import { ClientInfo, Matchmaker } from 'lobby';
import { IN_PROD, PORT } from './config';
import { Machikoro } from 'game';
import { MachikoroBoard } from 'board';

const defaultClientInfo: ClientInfo = {
  matchID: '',
  playerID: '',
  credentials: '',
};

/**
 * @extends ClientInfo
 * @param play If true, start the game.
 */
interface AppState extends ClientInfo {
  play: boolean;
}

/**
 * Create Machi Koro application.
 */
export default class App extends React.Component<object, AppState> {
  private serverOrigin: string; // URL and port of the server.

  constructor(props: object) {
    super(props);
    this.state = {
      ...defaultClientInfo,
      play: false,
    };
    this.serverOrigin = `${window.location.protocol}//${window.location.hostname}:${PORT}`;
  }

  setClientInfo = (clientInfo: ClientInfo): void => {
    this.setState(clientInfo);
  };

  clearClientInfo = (): void => {
    this.setState(defaultClientInfo);
  };

  startMatch = (): void => this.setState({ play: true });

  startDebug = (): void => {
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

      return <MachikoroClient matchID={matchID} playerID={playerID} credentials={credentials} />;
    } else {
      return (
        <div>
          {!IN_PROD ? ( // only show debug button in development
            <div className='padded_div'>
              <button onClick={this.startDebug}>DEBUG</button>
            </div>
          ) : null}
          <div className='title'>MACHI KORO</div>
          <Matchmaker
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            serverOrigin={this.serverOrigin}
            setClientInfo={this.setClientInfo}
            clearClientInfo={this.clearClientInfo}
            startMatch={this.startMatch}
          />
          <footer className='footer'>
            <a href='https://github.com/kevinddchen/machikoro' target='_blank' rel='noreferrer'>
              <img src='./GitHub-Mark-Light-32px.png' alt='GitHub logo' />
            </a>
          </footer>
        </div>
      );
    }
  }
}
