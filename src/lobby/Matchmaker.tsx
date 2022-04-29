import '../styles/main.css';
import React from 'react';
import { LobbyClient } from 'boardgame.io/client';
import Lobby from './Lobby';
import Room from './Room';
import type { ClientInfo } from '../App';

interface MatchmakerProps extends ClientInfo {
  serverOrigin: string;
  setClientInfo: (clientInfo: ClientInfo) => void;
  clearClientInfo: () => void;
  startMatch: () => void;
}

/**
 * @param name - Name of the player.
 * @param errorMessage - Error message to display.
 */
interface MatchmakerState {
  name: string;
  errorMessage: string;
}

/**
 * Handles match creation and joining via the `Lobby` component, and the
 * pre-match waiting room via the `Room` component. Also handles match
 * credential storage and retrieval via the `Authenticator` class.
 */
export default class Matchmaker extends React.Component<MatchmakerProps, MatchmakerState> {

  private lobbyClient: LobbyClient;

  constructor (props: MatchmakerProps) {
    super(props);
    this.state = {
      name: '',
      errorMessage: '',
    };
    this.lobbyClient = new LobbyClient({ server: props.serverOrigin });
  }

  setName = (name: string) => this.setState({ name });

  setErrorMessage = (errorMessage: string) => this.setState({ errorMessage });

  /**
   * Clear the error message. The render will only be updated if the error
   * message was not empty.
   */
  clearErrorMessage = () => {
    const { errorMessage } = this.state;
    if (errorMessage) {
      this.setState({ errorMessage: '' });
    }
  };

  // --- Render --------------------------------------------------------------

  render () {
    const { matchID, playerID, credentials } = this.props;
    const { name, errorMessage } = this.state;

    return (
      <div>
        {matchID ? // when `matchID` is not an empty string, we are in a room
          <Room
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            name={name}
            lobbyClient={this.lobbyClient}
            clearClientInfo={this.props.clearClientInfo}
            startMatch={this.props.startMatch}
            setErrorMessage={this.setErrorMessage}
            clearErrorMessage={this.clearErrorMessage}
          />
          : // otherwise we are in a lobby
          <Lobby
            name={name}
            lobbyClient={this.lobbyClient}
            setClientInfo={this.props.setClientInfo}
            setName={this.setName}
            setErrorMessage={this.setErrorMessage}
            clearErrorMessage={this.clearErrorMessage}
          />
        }
        <div className='errorMessage'>{errorMessage}</div>
      </div>
    );
  }
}
