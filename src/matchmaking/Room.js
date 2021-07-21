import './Room.css';
import React from 'react';
import Authenticator from './Authenticator'; // manages match credentials
import { gameName } from '../game/Game';
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
      let count = 0;
      const newPlayerList = match.players.map( (x) => {
        if (x.name) {
          count++;
          return x.name;
        } else {
          return '';
        }
      });
      // if seats are all full, start match now
      if (count === match.players.length) {
        this.props.start(matchID, this.playerID, this.credentials);
        return;
      }
      if (checkDifferent(newPlayerList, this.state.playerList)) {
        this.setState({playerList: newPlayerList});
      }
    } catch(e) {
      console.error("(fetchMatch)", e);
    }
  };

  leaveMatch = async () => {
    const { matchID } = this.props;
    const { playerID, credentials } = this;

    try {
      await this.props.lobbyClient.leaveMatch(gameName, matchID, { playerID, credentials });
      this.Authenticator.deleteCredentials(matchID);
      this.props.leaveRoom();
      console.log("Left match.");
    } catch(e) {
      this.props.setErrorMessage("Error in leaving match.");
      console.error("(leaveMatch)", e);
    }
  };

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
        <th className="col_ind"></th>
        <th className="col_id">Seat</th>
        <th className="col_name">Name</th>
      </tr>
    );
    for (let i=0; i<playerList.length; i++) {
      const indicator = (i == parseInt(this.playerID)) ? '-->' : null
      tbody.push(
        <tr key={i}>
          <td>{indicator}</td>
          <td>{i}</td>
          <td>{playerList[i]}</td>
        </tr>
      );
    }
    return tbody;
  }

  render() {
    const { matchID } = this.props;

    return (
      <div>
        <div className="padded_div">
          In match ({matchID}). 
          Game will start when seats are filled.
        </div>
        <div className="padded_div">
          <button onClick={this.leaveMatch}>Leave</button>
        </div>
        <div className="padded_div">
          <table><tbody>{this.renderPlayerList()}</tbody></table>
        </div>
      </div>
    );

  }

}

export default Room;
