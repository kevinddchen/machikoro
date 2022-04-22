import '../styles/main.css';
import React from 'react';
import _ from 'lodash';
import Authenticator from './Authenticator';
import { countPlayers } from './utils';
import { GAME_NAME } from '../game/Game';
import { UPDATE_INTERVAL } from '../config';


/**
 * Pre-match waiting room
 */
class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerList: [], // array of `player` objects
      expansion: '',
      supplyVariant: '',
    };
    this.fetchInterval = null;
    this.authenticator = new Authenticator();
  }

  /**
   * Fetches list of players from the server via API call. Also automatically
   * starts the game when there are enough people.
   */
  fetchMatch = async () => {
    const { matchID, lobbyClient } = this.props;
    const { playerList } = this.state;

    try {
      const match = await lobbyClient.getMatch(GAME_NAME, matchID);
      if (!_.isEqual(match.players, playerList)) {
        const { expansion, supplyVariant } = match.setupData
        this.setState({playerList: match.players, expansion, supplyVariant});
        // if seats are all full, start match now
        if (countPlayers(match.players) === match.players.length)
          this.props.startMatch();
      }
    } catch(e) {
      // TODO: do we need to display "Cannot fetch Matches" like in the Lobby?
      console.error("(fetchMatch)", e);
    }
  };

  /**
   * Leave the match and delete credentials.
   */
  leaveMatch = async () => {
    const { matchID, playerID, credentials, lobbyClient } = this.props;

    try {
      await lobbyClient.leaveMatch(GAME_NAME, matchID, { playerID, credentials });
      this.authenticator.deleteCredentials(matchID);
      this.props.clearMatchInfo();
      // this will trigger `Matchmaker` to switch to the lobby
    } catch(e) {
      this.props.setErrorMessage("Error when leaving match. Try again.");
      console.error("(leaveMatch)", e);
    }
  };

  // --- React -----------------------------------------------------------------

  componentDidMount() {
    const { matchID } = this.props;

    console.log(`Joined room for match '${matchID}'.`);
    this.props.clearErrorMessage();

    this.fetchMatch();
    this.fetchInterval = setInterval(this.fetchMatch, UPDATE_INTERVAL); 
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  // --- Render ----------------------------------------------------------------

  renderPlayerList() {
    const { playerID } = this.props;
    const { playerList } = this.state;

    const tbody = [];
    tbody.push(
      <tr key={-1}>
        <th className="col_ind"></th>
        <th className="col_playerid">Seat</th>
        <th className="col_name">Name</th>
      </tr>
    );
    for (let seat=0; seat<playerList.length; seat++) {
      const { id, name } = playerList[seat];
      let indicator, button;
      if (id.toString() === playerID) {
        indicator = '-->';
        button = <button onClick={this.leaveMatch}>Leave</button>
      }
      tbody.push(
        <tr key={seat}>
          <td>{indicator}</td>
          <td>{seat+1}</td>
          <td>{name}</td>
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
