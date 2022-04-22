import '../styles/main.css';
import React from 'react';
import Authenticator from './Authenticator'; // manages match credentials
import { checkDifferent, expansion_name, supplyVariant_name } from './utils';
import { gameName } from '../game/Game';

/**
 * Pre-match waiting room
 */

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
    for (let i=0; i<playerList.length; i++) {
      let button,
          addclass = "mm-td";
      if (i === parseInt(this.playerID)) {
        addclass = "mm-td mm-td-active";    /* use css as indicator */
        button = <button className="button" onClick={this.leaveMatch}>Leave</button>
      }
      tbody.push(
        <td className={addclass} key={i}>
          {i+1}: {playerList[i]} <br/> {button}
        </td>
      );
    }
    return tbody;
  }

  render() {
    const { matchID } = this.props;
    const { expansion, supplyVariant } = this.state;

    return (
      <div align="center"><br/>
        <div className="mm-container">
          <div className="mm-div-row">
            <div className="mm-div-cell"><b>Room ID:</b> {matchID}</div>
            <div className="mm-div-cell"><b>{expansion_name(expansion)}</b></div>
            <div className="mm-div-cell"><b>{supplyVariant_name(supplyVariant)}</b></div>
          </div>
          <div className="mm-div-row">Game will start when all seats are filled.</div>
          <div className="mm-div-row"><div className="mm-div-cell">
            <b>Players</b><br/> <table className="mm-table">{this.renderPlayerList()}</table>
          </div></div>
        </div>
      </div>
    );

  }

}

export default Room;
