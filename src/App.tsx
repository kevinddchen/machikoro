import 'styles/main.css';

import { Client } from 'boardgame.io/react';
import React from 'react';
import { SocketIO } from 'boardgame.io/multiplayer';

import { IN_PROD, PORT } from './config';
import { MatchInfo, Matchmaker, debugMatchInfo } from 'lobby';
import { Machikoro } from 'game';
import { MachikoroBoard } from 'board';

/**
 * @prop {MatchInfo|null} matchInfo - Information a client needs to connect to a match.
 * @prop {boolean} play - Boolean switch between rendering the game client and the matchmaking lobby.
 */
interface AppState {
  matchInfo: MatchInfo | null;
  play: boolean;
}

/**
 * Machi Koro application.
 * @prop {string} serverOrigin - URL of the server.
 */
export default class App extends React.Component<object, AppState> {
  private serverOrigin: string;

  constructor(props: object) {
    super(props);
    this.state = { matchInfo: null, play: false };
    this.serverOrigin = `${window.location.protocol}//${window.location.hostname}:${PORT}`;
  }

  private setMatchInfo = (matchInfo: MatchInfo): void => {
    this.setState({ matchInfo });
  };

  private clearMatchInfo = (): void => {
    this.setState({ matchInfo: null });
  };

  private startMatch = (): void => {
    this.setState({ play: true });
  };

  private startDebug = (): void => {
    this.setMatchInfo(debugMatchInfo);
    this.startMatch();
  };

  // --- Render ---------------------------------------------------------------

  private debugButton = (): JSX.Element => {
    // only render in development mode!
    return (
      <div className='padded_div'>
        <button onClick={this.startDebug}>DEBUG</button>
      </div>
    );
  };

  render() {
    const { matchInfo, play } = this.state;

    if (matchInfo && play) {
      // Render the game client
      const { matchID, playerID, credentials } = matchInfo;
      const MachikoroClient = Client({
        game: Machikoro,
        board: MachikoroBoard,
        multiplayer: SocketIO({ server: this.serverOrigin }),
      });

      return <MachikoroClient matchID={matchID} playerID={playerID} credentials={credentials} />;
    } else {
      // Render the matchmaking lobby
      return (
        <div>
          {IN_PROD ? null : this.debugButton()}
          <div className='title'>MACHI KORO</div>
          <Matchmaker
            matchInfo={matchInfo}
            serverOrigin={this.serverOrigin}
            setMatchInfo={this.setMatchInfo}
            clearMatchInfo={this.clearMatchInfo}
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
