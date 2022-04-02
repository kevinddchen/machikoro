import '../styles/lobby.css';
import React from 'react';
import { LobbyClient } from 'boardgame.io/client';
import Lobby from './Lobby'; // manages game creation and joining
import Room from './Room'; // manages pre-match waiting room

class Matchmaker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: '',
      errorMessage: '',
    }
    this.lobbyClient = new LobbyClient({ server: props.serverOrigin });
  }

  setErrorMessage = (msg) => {
    this.setState({errorMessage: msg});
  };

  clearErrorMessage = () => {
    this.setState({errorMessage: ''});
  };

  joinRoom = (matchID) => {
    this.setState({matchID});
    this.clearErrorMessage();
  };

  leaveRoom = () => {
    this.setState({matchID: ''});
    this.clearErrorMessage();
  };

  // --- React -----------------------------------------------------------------

  async componentDidMount() {
    try {
      await this.lobbyClient.listGames();
      console.log("Lobby client connected");
    } catch(e) {
      console.error(e);
    }
  }

  // --- Render ----------------------------------------------------------------

  render() {
    const { matchID, errorMessage } = this.state;

    return (
      <div>
        { matchID ? 
          <Room
            lobbyClient={this.lobbyClient}
            matchID={matchID}
            updateInterval={1000}
            setErrorMessage={this.setErrorMessage}
            leaveRoom={this.leaveRoom}
            start={this.props.start}/>
          :
          <Lobby 
            lobbyClient={this.lobbyClient}
            updateInterval={1000}
            setErrorMessage={this.setErrorMessage}
            joinRoom={this.joinRoom}/>
        }
        <div className="errorMessage">{errorMessage}</div>
      </div>
    );

  }
}

export default Matchmaker;
