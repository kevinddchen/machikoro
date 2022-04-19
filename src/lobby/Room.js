import '../styles/main.css';
import React from 'react';
import Authenticator from './Authenticator'; // manages match credentials
import { checkDifferent } from './utils';
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
        button = <button class="button" onClick={this.leaveMatch}>Leave</button>
      }
      tbody.push(
        <td class={addclass} key={i}>
          {i+1}: {playerList[i]} <br/> {button}
        </td>
      );
    }
    return tbody;
  }

  render() {
    const { matchID } = this.props;
    const { expansion, supplyVariant } = this.state;

    let text_expansion = '',
        text_supplyVariant = '';

    switch (expansion) {
      case 'base':
        text_expansion = 'Base Game';
        break;
      case 'harbor':
        text_expansion = 'Harbor Expansion';
        break;
      default:
        text_expansion = '??? Expansion';
    }

    switch (supplyVariant) {
      case 'hybrid':
        text_supplyVariant = 'Hybrid Supply';
        break;
      case 'variable':
        text_supplyVariant = 'Variable Supply';
        break;
      case 'total':
        text_supplyVariant = 'Total Supply';
        break;
      default:
        text_supplyVariant = '??? Supply Variant';
    }

    return (
      <div align="center"><br/>
        <div class="mm-container">
          <div class="mm-div-row">
            <div class="mm-div-cell"><b>Room ID:</b> {matchID}</div>
            <div class="mm-div-cell"><b>{text_expansion}</b></div>
            <div class="mm-div-cell"><b>{text_supplyVariant}</b></div>
          </div>
          <div class="mm-div-row">Game will start when all seats are filled.</div>
          <div class="mm-div-row"><div class="mm-div-cell">
            <b>Players</b><br/> <table class="mm-table">{this.renderPlayerList()}</table>
          </div></div>
        </div>
      </div>
    );

  }

}

export default Room;
