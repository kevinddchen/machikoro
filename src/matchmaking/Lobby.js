import './Lobby.css';
import React from 'react';
import Authenticator from './Authenticator'; // manages match credentials
import { gameName } from '../game/Game';
import { checkDifferent } from './utils';

class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      numPlayers: 4,
      matchList: null, // {matchID: string, currPlayers: number, numPlayers: number}
    };
    this.matchCounts = null; // number[]
    this.interval = null;
    this.Authenticator = new Authenticator();
  }

  setName = (e) => {
    // TODO: prevent bad user inputs
    this.setState({name: e.target.value});
  };

  setNumPlayers = (e) => {
    // TODO: prevent bad user inputs
    this.setState({numPlayers: parseInt(e.target.value)});
  };

  /**
   * Periodically fetches list of matches from server. Updates render only when
   * list changes.
   */
  fetchMatches = async () => {
    const { lobbyClient } = this.props;

    try {
      const { matches } = await lobbyClient.listMatches(gameName);
      const newMatchCounts = matches.map(this._countPlayers);
      // if number of current players do not agree, update
      if (checkDifferent(newMatchCounts, this.matchCounts)) {
        const newMatchList = [];
        for (let i=0; i<matches.length; i++) {
          newMatchList.push({
            matchID: matches[i].matchID, 
            currPlayers: newMatchCounts[i],
            numPlayers: matches[i].players.length
          });
        }
        this.setState({matchList: newMatchList});
        this.matchCounts = newMatchCounts;
      }
    } catch(e) {
      console.error("(fetchMatches)", e);
    }
  };

  _countPlayers(match) {
    let count = 0;
    match.players.forEach( (x) => {if ("name" in x) count++});
    return count;
  }

  // --- Match management ------------------------------------------------------

  createMatch = async () => {
    const { name, numPlayers } = this.state;

    if (name.length === 0) {
      this.props.setErrorMessage("Please enter a name.");
      return;
    }
    try {
      const { matchID } = await this.props.lobbyClient.createMatch(gameName, {numPlayers: numPlayers});
      console.log(`Created match '${matchID}'.`);
      await this.joinMatch(matchID);
    } catch(e) {
      this.props.setErrorMessage("Error in creating match.");
      console.error("(createMatch)", e);
    }
  };

  joinMatch = async (matchID) => {
    try {
      if (this.hasCredentials(matchID) || await this._joinWithoutCredentials(matchID)) {
        this.props.joinRoom(matchID);
        console.log(`Joined match '${matchID}'.`);
      }
    } catch(e) {
      this.props.setErrorMessage("Error in joining match.");
      console.error("(joinMatch)", e);
    }
  };

  hasCredentials = (matchID) => {
    return this.Authenticator.hasCredentials(matchID);
  };

  /**
   * Returns true on success, false on failure.
   */
  _joinWithoutCredentials = async (matchID) => {
    const { name } = this.state;

    if (name.length === 0) {
      this.props.setErrorMessage("Please enter a name.");
      return false;
    }

    // find an open seat
    const match = await this.props.lobbyClient.getMatch(gameName, matchID);
    let seat; // number
    for (let i=0; i<match.players.length; i++) {
      if ("name" in match.players[i]) {
        if (match.players[i].name === name) {
          this.props.setErrorMessage("Name already taken.");
          return false;
        }
      } else if (seat === undefined) {
        seat = i.toString();
      }
    }
    if (seat === undefined) {
      this.props.setErrorMessage("No free seats available.");
      return false;
    }

    // try to join match
    const { playerCredentials } = await this.props.lobbyClient.joinMatch(
      gameName,
      matchID,
      {
        playerID: seat,
        playerName: name,
      }
    );
    this.Authenticator.saveCredentials(matchID, seat, playerCredentials);
    console.log(`Obtained credentials for match '${matchID}', seat ${seat}.`);
    return true;
  };

  // --- React -----------------------------------------------------------------

  componentDidMount() {
    const { updateInterval } = this.props;
    const { name, numPlayers } = this.state;

    this.interval = setInterval(this.fetchMatches, updateInterval); 
    document.getElementById("input_name").value = name;
    document.getElementById("input_numPlayers").value = numPlayers;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // --- Render ----------------------------------------------------------------

  renderMatchList() {
    const { matchList } = this.state;

    const tbody = [];
    if (!matchList) {
      tbody.push(
        <tr key={0}><td>Fetching matches...</td></tr>
      );
    } else if (matchList.length === 0) {
      tbody.push(
        <tr key={0}><td>No open matches.</td></tr>
      );
    } else {
      tbody.push(
        <tr key={-1}>
          <th className="col_id">Match ID</th>
          <th className="col_seats">Seats</th>
        </tr>
      );
      for (let i=0; i<matchList.length; i++) {
        const { matchID, currPlayers, numPlayers } = matchList[i];
        let button;
        if (this.hasCredentials(matchID)) {
          button = <button onClick={() => this.joinMatch(matchID)}>Rejoin</button>;
        } else if (currPlayers === numPlayers) {
          button = null;
        } else {
          button = <button onClick={() => this.joinMatch(matchID)}>Join</button>;
        }
        tbody.push(
          <tr key={i}>
            <td>{matchID}</td>
            <td>{currPlayers}/{numPlayers}</td>
            <td>{button}</td>
          </tr>
        );
      }
    }
    return tbody;
  }

  render() {

    return (
      <div>
        <div className="padded_div">
          Name:&nbsp;
          <input
            id="input_name"
            type="text"
            maxLength={16}
            spellCheck="false"
            autoComplete="off"
            onChange={this.setName}
          />
        </div>
        <div className="padded_div">
          <button onClick={this.createMatch}>Create Match</button>
          &nbsp;Players:&nbsp;
          <select 
            id="input_numPlayers"
            onChange={this.setNumPlayers}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div className="padded_div">
          <table><tbody>{this.renderMatchList()}</tbody></table>
        </div>
      </div>
    );

  }
}

export default Lobby;
