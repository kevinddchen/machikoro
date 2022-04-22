import '../styles/main.css';
import React from 'react';
import { LobbyClient } from 'boardgame.io/client';
import Lobby from './Lobby';
import Room from './Room';

/**
 * Manages match creation and joining via the `Lobby` component, and the
 * pre-match waiting room via the `Room` component. Also handles match
 * credentials and authentication via the `Authenticator` class.
 */
class Matchmaker extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      name: '', // persists across leaving / entering lobby
      errorMessage: '' // any error message to display at the bottom of the page
    };
    this.lobbyClient = new LobbyClient({ server: props.serverOrigin });
  }

  setName = (name) => this.setState({ name });

  setErrorMessage = (errorMessage) => this.setState({ errorMessage });

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
            lobbyClient={this.lobbyClient}
            setErrorMessage={this.setErrorMessage}
            clearErrorMessage={this.clearErrorMessage}
            clearMatchInfo={this.props.clearMatchInfo}
            startMatch={this.props.startMatch}
          />
          : // otherwise we are in a lobby
          <Lobby
            name={name}
            lobbyClient={this.lobbyClient}
            setName={this.setName}
            setErrorMessage={this.setErrorMessage}
            clearErrorMessage={this.clearErrorMessage}
            setMatchInfo={this.props.setMatchInfo}
          />
        }
        <div className='errorMessage'>{errorMessage}</div>
      </div>
    );
  }
}

export default Matchmaker;
