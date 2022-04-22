import '../styles/main.css';
import React from 'react';
import Authenticator from './Authenticator'; // manages match credentials
import { checkDifferent, expansion_name, supplyVariant_name } from './utils';
import { gameName } from '../game/Game';

/**
 * Handles match creation and joining matches
 */

class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      numPlayers: 4,
      matchList: null, // type: {matchID: string, currPlayers: number, numPlayers: number}
      expansion: 'base',
      supplyVariant: 'hybrid',
      fetchErrors: 0,
    };
    this.matchCounts = null; // type: number[]
    this.interval = null;
    this.Authenticator = new Authenticator();
  }

  setName = (e) => {
    this.setState({name: e.target.value});
  };

  setNumPlayers = (e) => {
    this.setState({numPlayers: parseInt(e.target.value)});
  };

  setExpansion = (e) => {
    this.setState({expansion: e.target.value});
  }

  setSupplyVariant = (e) => {
    this.setState({supplyVariant: e.target.value});
  }

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
          const { matchID, players, setupData } = matches[i]
          newMatchList.push({
            matchID, 
            currPlayers: newMatchCounts[i],
            numPlayers: players.length,
            setupData,
          });
        }
        this.setState({matchList: newMatchList});
        this.matchCounts = newMatchCounts;
      }
    } catch(e) {
      const { fetchErrors } = this.state;
      this.setState({fetchErrors: fetchErrors+1});
      console.error("(fetchMatches)", e);
    }
  };

  _countPlayers(match) {
    let count = 0;
    match.players.forEach( (x) => {if ("name" in x) count++});
    return count;
  }

  // --- Match management ------------------------------------------------------

  /**
   * Create a match based on the selected options.
   */
  createMatch = async () => {
    const { name, numPlayers, expansion, supplyVariant } = this.state;

    if (name.length === 0) {
      this.props.setErrorMessage("Please enter a name.");
      return;
    }
    try {
      const { matchID } = await this.props.lobbyClient.createMatch(gameName, {
        numPlayers,
        setupData: {expansion, supplyVariant, startCoins: 3, randomizeTurnOrder: true},
      });
      console.log(`Created match '${matchID}'.`);
      await this.joinMatch(matchID);
    } catch(e) {
      this.props.setErrorMessage("Error in creating match.");
      console.error("(createMatch)", e);
    }
  };

  /**
   * Join a match given the internal `matchID`.
   */
  joinMatch = async (matchID) => {
    try {
      if (this.Authenticator.hasCredentials(matchID) || await this._joinWithoutCredentials(matchID)) {
        this.props.joinRoom(matchID);
        console.log(`Joined match '${matchID}'.`);
      }
    } catch(e) {
      this.props.setErrorMessage("Error in joining match.");
      console.error("(joinMatch)", e);
    }
  };

  /**
   * Tries to create new credentials to join match. Returns true on success,
   * false on failure.
   */
  _joinWithoutCredentials = async (matchID) => {
    const { name } = this.state;

    if (name.length === 0) {
      this.props.setErrorMessage("Please enter a name.");
      return false;
    }

    // find an open seat
    const match = await this.props.lobbyClient.getMatch(gameName, matchID);
    let seat; 
    for (let i=0; i<match.players.length; i++) {
      if ("name" in match.players[i]) { // check if seat is occupied
        if (match.players[i].name === name) {
          this.props.setErrorMessage("Name already taken.");
          return false;
        }
      } else { // if seat is not occupied, then sit
        seat = i;
        break;
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
        playerID: seat.toString(),
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
    const { name, numPlayers, expansion, supplyVariant } = this.state;

    this.fetchMatches();
    this.interval = setInterval(this.fetchMatches, updateInterval); 
    // set default values
    document.getElementById("input_name").value = name;
    document.getElementById("input_numPlayers").value = numPlayers;
    document.getElementById("input_expansion").value = expansion;
    document.getElementById("input_supplyVariant").value = supplyVariant;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // --- Render ----------------------------------------------------------------

  renderMatchList() {
    const { matchList, fetchErrors } = this.state;

    const tbody = [];
    if (!matchList) {
      tbody.push(<tr key={0}><td>Fetching matches...</td></tr>);
      if (fetchErrors > 3 && window.location.protocol === "https:")
        tbody.push(<tr key={1}><td>(try connecting with http instead of https...)</td></tr>);
    } else if (matchList.length === 0) {
      tbody.push(
        <tr key={0}><td>No open matches.</td></tr>
      );
    } else {
      // tbody.push(
      //   <tr key={-1}>
      //     <th className="col_matchid">Match ID</th>
      //     <th className="col_seats">Seats</th>
      //     <th className="col_setup">Setup</th>
      //   </tr>
      // );
      for (let i=0; i<matchList.length; i++) {
        const { matchID, currPlayers, numPlayers, setupData } = matchList[i];
        let button;
        if (this.Authenticator.hasCredentials(matchID)) {
          button = <button className="button" onClick={() => this.joinMatch(matchID)}>Rejoin</button>;
        } else if (currPlayers === numPlayers) {
          button = null;
        } else {
          button = <button className="button" onClick={() => this.joinMatch(matchID)}>Join</button>;
        }
        tbody.push(
          <div className="lobby-container" key={i}>
              <div className="lobby-div-col lobby-div-col-width">
                <div className="lobby-div-row"><b>Room ID:</b> {matchID}</div>
              </div>
              <div className="lobby-div-col lobby-div-col-width">
                <div className="lobby-div-row">{expansion_name(setupData.expansion)}</div>
                <div className="lobby-div-row">{supplyVariant_name(setupData.supplyVariant)}</div>
              </div>
              <div className="lobby-div-col lobby-div-col-width">
                <div className="lobby-div-row">{currPlayers} / {numPlayers} players</div>
                <div className="lobby-div-row">
                  {Array(currPlayers).fill('X')}{Array(numPlayers-currPlayers).fill('O')}
                </div>
              </div>
              <div className="lobby-div-col">{button}</div>
          </div>
        );
      }
    }
    return tbody;
  }

  render() {

    return (
      <div>
        <div className="padded_div">
          <span>Enter Player Name: </span>
          <input
            className="input-box"
            id="input_name"
            type="text"
            maxLength={16}
            spellCheck="false"
            autoComplete="off"
            onChange={this.setName}
          />
        </div>
        <div className="padded_div">
          <span className="subtitle">Create Room</span>
          <br/>
          <select id="input_numPlayers" onChange={this.setNumPlayers}>
            <option value="2">2 Players</option>
            <option value="3">3 Players</option>
            <option value="4">4 Players</option>
            <option value="5">5 Players</option>
          </select>
          <select id="input_expansion" onChange={this.setExpansion}>
            <option value="base">Base Game</option>
            <option value="harbor">Harbor Expansion</option>
          </select>
          <select id="input_supplyVariant" onChange={this.setSupplyVariant}>
            <option value="hybrid">Hybrid Supply</option>
            <option value="variable">Variable Supply</option>
            <option value="total">Total Supply</option>
          </select>
          <button className="button" onClick={this.createMatch}>
            Create Room
          </button>
        </div>
        <div className="padded_div">
          <span className="subtitle">Lobby</span>
          <div align="center">{this.renderMatchList()}</div>
        </div>
      </div>
    );

  }
}

export default Lobby;
