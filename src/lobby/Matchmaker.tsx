import 'styles/main.css';

import { LobbyClient } from 'boardgame.io/client';
import React from 'react';

import Lobby from './Lobby';
import { MatchInfo } from './types';
import Room from './Room';

/**
 * @prop {MatchInfo|null} matchInfo - Information a client needs to connect to a match.
 * @prop {string} serverOrigin - URL of the server.
 * @func setMatchInfo - Callback to set match info.
 * @func clearMatchInfo - Callback to clear match info.
 * @func startMatch - Callback to start match.
 */
interface MatchmakerProps {
  matchInfo: MatchInfo | null;
  serverOrigin: string;
  setMatchInfo: (matchInfo: MatchInfo) => void;
  clearMatchInfo: () => void;
  startMatch: () => void;
}

/**
 * @prop {string} name - Name of the player.
 * @prop {string} errorMessage - Error message to display.
 */
interface MatchmakerState {
  name: string;
  errorMessage: string;
}

/**
 * Component that handles match creation and joining via the `Lobby` component,
 * and the pre-match waiting room via the `Room` component. A client starts in
 * the `Lobby`. If they successfully create or join a match, then the client is
 * then directed to the `Room`, where they wait for the match to start.
 * @prop {LobbyClient} lobbyClient - `LobbyClient` instance used to interact
 * with server match management API.
 */
export default class Matchmaker extends React.Component<MatchmakerProps, MatchmakerState> {
  private lobbyClient: LobbyClient;

  constructor(props: MatchmakerProps) {
    super(props);
    this.state = {
      name: '',
      errorMessage: '',
    };
    this.lobbyClient = new LobbyClient({ server: props.serverOrigin });
  }

  setName = (name: string): void => {
    this.setState({ name });
  };

  setErrorMessage = (errorMessage: string): void => {
    this.setState({ errorMessage });
  };

  /**
   * Clear the error message. The render will only be updated if the error
   * message was not empty.
   */
  clearErrorMessage = (): void => {
    const { errorMessage } = this.state;
    if (errorMessage) {
      this.setState({ errorMessage: '' });
    }
  };

  // --- Render ---------------------------------------------------------------

  render() {
    const { matchInfo } = this.props;
    const { name, errorMessage } = this.state;

    let component: JSX.Element;
    if (matchInfo) {
      // Render `Room` if the client has a match.
      component = (
        <Room
          name={name}
          lobbyClient={this.lobbyClient}
          matchInfo={matchInfo}
          clearMatchInfo={this.props.clearMatchInfo}
          startMatch={this.props.startMatch}
          setErrorMessage={this.setErrorMessage}
          clearErrorMessage={this.clearErrorMessage}
        />
      );
    } else {
      // Render `Lobby` otherwise.
      component = (
        <Lobby
          name={name}
          lobbyClient={this.lobbyClient}
          setMatchInfo={this.props.setMatchInfo}
          setName={this.setName}
          setErrorMessage={this.setErrorMessage}
          clearErrorMessage={this.clearErrorMessage}
        />
      );
    }

    return (
      <div>
        {component}
        <div className='errorMessage'>{errorMessage}</div>
      </div>
    );
  }
}
