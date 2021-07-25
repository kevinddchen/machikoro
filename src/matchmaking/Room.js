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
      expansion: '',
      supplyVariant: '',
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
        const { expansion, supplyVariant } = match.setupData;
        this.setState({
          playerList: newPlayerList,
          expansion,
          supplyVariant,
        });
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
    this.fetchMatch();
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
        <th className="col_playerid">Seat</th>
        <th className="col_name">Name</th>
      </tr>
    );
    for (let i=0; i<playerList.length; i++) {
      let indicator,
          button;
      if (i === parseInt(this.playerID)) {
        indicator = '-->';
        button = <button onClick={this.leaveMatch}>Leave</button>
      }
      tbody.push(
        <tr key={i}>
          <td>{indicator}</td>
          <td>{i+1}</td>
          <td>{playerList[i]}</td>
          <td>{button}</td>
        </tr>
      );
    }
    return tbody;
  }

  render() {
    const { matchID } = this.props;
    const { expansion, supplyVariant } = this.state;

    return (
      <div>
        <div className="padded_div">
          <div>In match ({matchID}).</div>
          <div>- Expansion: {expansion}</div>
          <div>- Supply variant: {supplyVariant}</div>
          <div>Game will start when seats are filled.</div>
        </div>
        <div className="padded_div">
          <table><tbody>{this.renderPlayerList()}</tbody></table>
        </div>
      </div>
    );

  }

}

export default Room;
