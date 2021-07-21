import './Room.css';
import React from 'react';
import Authenticator from './Authenticator'; // manages match credentials
import { gameName } from '../Game';
import { checkDifferent } from './utils';

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerList: [], // string[]
    }
    this.interval = null;
    this.Authenticator = new Authenticator();
    ({playerID: this.playerID, credentials: this.credentials } = this.Authenticator.fetchCredentials(props.matchID));
  }

  /**
   * Periodically fetches list of players from server. Updates render only when
   * list changes.
   */
  fetchMatch = async () => {
    const { matchID, lobbyClient } = this.props;

    try {
      const match = await lobbyClient.getMatch(gameName, matchID);
      const newPlayerList = match.players.map( (x) => (x.name ? x.name : ''));
      console.log(newPlayerList);
      if (checkDifferent(newPlayerList, this.state.playerList)) {
        this.setState({playerList: newPlayerList});
      }
    } catch(e) {
      console.error("(fetchMatch)", e);
      return;
    }
  };

  leaveMatch = async () => {
    const { matchID } = this.props;
    const { playerID, credentials } = this;

    try {
      await this.props.lobbyClient.leaveMatch(gameName, matchID, { playerID, credentials });
      this.Authenticator.deleteCredentials(matchID);
      this.props.leaveRoom();
    } catch(e) {

    }
    
  }

  // --- React -----------------------------------------------------------------

  componentDidMount() {
    const { updateInterval } = this.props;
    this.interval = setInterval(this.fetchMatch, updateInterval); 
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // --- Render ----------------------------------------------------------------

  renderPlayerList() {
    const { playerList } = this.state;

    const tbody = [];
    tbody.push(
      <tr key={-1}>
        <th className="playerid">Seat</th>
        <th className="name">Name</th>
        <th></th>
      </tr>
    );
    for (let i=0; i<playerList.length; i++) {
      tbody.push(
        <tr key={i}>
          <td>{i}</td>
          <td>{playerList[i]}</td>
        </tr>
      );
    }
    return tbody;
  }

  render() {
    const { matchID } = this.props;

    console.log("newrender");
    return (
      <div>
        <div className="div">
          In match ({matchID})&nbsp;
          <button onClick={this.leaveMatch}>Leave</button>
        </div>
        <div className="div">
          <table><tbody>{this.renderPlayerList()}</tbody></table>
        </div>
      </div>
    );

  }

}

export default Room;
