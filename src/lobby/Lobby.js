import '../styles/main.css';
import React from 'react';
import _ from 'lodash';
import Authenticator from './Authenticator';
import { countPlayers, expansionName, supplyVariantName } from './utils';
import { GAME_NAME } from '../game/Game';
import { UPDATE_INTERVAL } from '../config';

/*

Since `Lobby` makes API requests, here are some notes on the objects that we
receive and send:

The `match` object has the following interface:
- createdAt: number
- gameName: string that probably equals "machikoro"
- matchID: string that uniquely identifies the match
- players: array of `player` objects
- setupData: object containing setup data that we set in `createMatch`
- unlisted: boolean
- updatedAt: number

A `player` object has the following interface:
- id: number. 0, 1, 2, ...
- name: string. This is only populated if a player occupies the seat.

Other pieces of metadata that we communicate with the server:
- playerID: string that equals the player's id (see above)
- credentials: string that acts like a player's password and authenticates
    all interactions with the server (e.g. leaving match, game moves)

*/

/**
 * Handles match creation and joining.
 */
class Lobby extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      numPlayers: 4,
      expansion: 'base',
      supplyVariant: 'hybrid',
      matchList: null // array of `match` objects
    };
    this.fetchInterval = null;
    this.authenticator = new Authenticator();
  }

  setName = (e) => {
    this.props.setName(e.target.value);
  };

  setNumPlayers = (e) => {
    this.setState({ numPlayers: parseInt(e.target.value) });
  };

  setExpansion = (e) => {
    this.setState({ expansion: e.target.value });
  }

  setSupplyVariant = (e) => {
    this.setState({ supplyVariant: e.target.value });
  }

  // --- Fetch matches --------------------------------------------------------

  /**
   * Fetch available matches from the server via API call.
   */
  fetchMatches = async () => {
    const { lobbyClient } = this.props;
    const { matchList } = this.state;

    try {
      const { matches } = await lobbyClient.listMatches(GAME_NAME);
      if (!_.isEqual(matches, matchList)) {
        this.setState({ matchList: matches });
      }
    } catch (e) {
      // The game currently does not allow https connections
      if (window.location.protocol === 'https:') {
        this.props.setErrorMessage('You must connect with `http` instead of `https`.');
      }
      console.error('(fetchMatch)', e);
    }
  };

  // --- Match management -----------------------------------------------------

  /**
   * Create a match based on the selected options.
   */
  createMatch = async () => {
    const { lobbyClient } = this.props;
    const { numPlayers, expansion, supplyVariant } = this.state;

    if (!this.validateName()) {
      return;
    }

    try {
      // create match
      const { matchID } = await lobbyClient.createMatch(GAME_NAME, {
        numPlayers,
        setupData: { expansion, supplyVariant, startCoins: 3, randomizeTurnOrder: true }
      });
      console.log(`Created match '${matchID}'.`);
      // after creating the match, try to join
      await this.joinMatch(matchID);
    } catch (e) {
      this.props.setErrorMessage('Error when creating match. Try again.');
      console.error('(createMatch)', e);
    }
  };

  /**
   * Join a match given the internal `matchID`.
   * @param {string} matchID
   */
  joinMatch = async (matchID) => {
    try {
      if (this.authenticator.hasCredentials(matchID) || await this.joinMatchNoCredentials(matchID)) {
        const { playerID, credentials } = this.authenticator.fetchCredentials(matchID);
        this.props.setMatchInfo(matchID, playerID, credentials);
        // this will trigger `Matchmaker` to switch to the waiting room
      } else {
        // specific error messages should have been displayed, so no feedback is needed here
      }
    } catch (e) {
      this.props.setErrorMessage('Error when joining match. Try again.');
      console.error('(joinMatch)', e);
    }
  };

  /**
   * Join a match by creating new credentials.
   * @param {string} matchID
   * @returns {boolean} true on success, false on failure.
   */
  joinMatchNoCredentials = async (matchID) => {
    const { name, lobbyClient } = this.props;

    if (!this.validateName()) {
      return false;
    }

    const match = await lobbyClient.getMatch(GAME_NAME, matchID);
    let playerID;
    // look for an available seat
    for (let seat = 0; seat < match.players.length; seat++) {
      if ('name' in match.players[seat]) {
        // if seat is occupied, check the player does not share same name
        if (match.players[seat].name === name) {
          this.props.setErrorMessage('Name already taken.');
          return false;
        }
      } else if (playerID === undefined) {
        // if haven't already found a seat, sit
        playerID = seat.toString();
      }
    }

    // check if could not find a seat
    if (playerID === undefined) {
      this.props.setErrorMessage('No free seats available.');
      return false;
    }

    // try to join match
    const { playerCredentials } = await lobbyClient.joinMatch(
      GAME_NAME,
      matchID,
      { playerID, playerName: name }
    );
    this.authenticator.saveCredentials(matchID, playerID, playerCredentials);
    console.log(`Saved credentials for match '${matchID}', seat ${playerID}.`);
    return true;
  };

  // --- Helper ----------------------------------------------------------------

  /**
   * Returns true if `name` is OK.
   * @returns {boolean}
   */
  validateName = () => {
    const { name } = this.props;
    if (name.length === 0) {
      this.props.setErrorMessage('Please enter a name.');
      return false;
    }
    if (name.length > 16) {
      this.props.setErrorMessage('Name is too long.');
      return false;
    }
    return true;
  }

  // --- React -----------------------------------------------------------------

  componentDidMount () {
    const { name } = this.props;
    const { numPlayers, expansion, supplyVariant } = this.state;

    console.log('Joined lobby.');
    this.props.clearErrorMessage();

    // set default values
    document.getElementById('input_name').value = name;
    document.getElementById('input_numPlayers').value = numPlayers;
    document.getElementById('input_expansion').value = expansion;
    document.getElementById('input_supplyVariant').value = supplyVariant;

    this.fetchMatches();
    this.fetchInterval = setInterval(this.fetchMatches, UPDATE_INTERVAL);
  }

  componentWillUnmount () {
    clearInterval(this.fetchInterval);
  }

  // --- Render ----------------------------------------------------------------

  renderMatchList () {
    const { matchList } = this.state;

    const tbody = [];
    if (!matchList) {
      tbody.push(<tr key={0}><td>Fetching matches...</td></tr>);
    } else if (matchList.length === 0) {
      tbody.push(<tr key={0}><td>No open matches.</td></tr>);
    } else {
      for (let i = 0; i < matchList.length; i++) {
        const { matchID, players, setupData } = matchList[i];
        const numActivePlayers = countPlayers(players);
        const numPlayers = players.length;
        let button;
        if (this.authenticator.hasCredentials(matchID)) {
          /// Able to automatically join the room (e.g. joined before, but closed browser)
          button = <button className='button' onClick={() => this.joinMatch(matchID)}>Rejoin</button>;
        } else if (numActivePlayers === numPlayers) {
          // Room is full
          button = null;
        } else {
          button = <button className='button' onClick={() => this.joinMatch(matchID)}>Join</button>;
        }
        tbody.push(
          <div className='lobby-container' key={i}>
            <div className='lobby-div-col lobby-div-col-width'>
              <div className='lobby-div-row'><b>Room ID: </b>{matchID}</div>
            </div>
            <div className='lobby-div-col lobby-div-col-width'>
              <div className='lobby-div-row'>{expansionName(setupData.expansion)}</div>
              <div className='lobby-div-row'>{supplyVariantName(setupData.supplyVariant)}</div>
            </div>
            <div className='lobby-div-col lobby-div-col-width'>
              <div className='lobby-div-row'>{numActivePlayers} / {numPlayers} players</div>
              <div className='lobby-div-row'>
                {Array(numActivePlayers).fill('X')}{Array(numPlayers - numActivePlayers).fill('O')}
              </div>
            </div>
            <div className='lobby-div-col'>{button}</div>
          </div>
        );
      }
    }
    return tbody;
  }

  render () {
    return (
      <div>
        <div className='padded_div'>
          <span>Enter Player Name: </span>
          <input
            className='input-box'
            id='input_name'
            type='text'
            maxLength={16}
            spellCheck='false'
            autoComplete='off'
            onChange={this.setName}
          />
        </div>
        <div className='padded_div'>
          <span className='subtitle'>Create Room</span>
          <br />
          <select id='input_numPlayers' onChange={this.setNumPlayers}>
            <option value='2'>2 Players</option>
            <option value='3'>3 Players</option>
            <option value='4'>4 Players</option>
            <option value='5'>5 Players</option>
          </select>
          <select id='input_expansion' onChange={this.setExpansion}>
            <option value='base'>Base Game</option>
            <option value='harbor'>Harbor Expansion</option>
          </select>
          <select id='input_supplyVariant' onChange={this.setSupplyVariant}>
            <option value='hybrid'>Hybrid Supply</option>
            <option value='variable'>Variable Supply</option>
            <option value='total'>Total Supply</option>
          </select>
          <button className='button' onClick={this.createMatch}>
            Create Room
          </button>
        </div>
        <div className='padded_div'>
          <span className='subtitle'>Lobby</span>
          <div align='center'>{this.renderMatchList()}</div>
        </div>
      </div>
    );
  }
}

export default Lobby;
