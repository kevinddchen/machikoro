import 'styles/main.css';

import { LobbyAPI } from 'boardgame.io';
import { LobbyClient } from 'boardgame.io/client';
import React from 'react';
import _ from 'lodash';

import { Expansion, GAME_NAME, SetupData, SupplyVariant } from 'game';
import { countPlayers, expansionName, seatIsOccupied, supplyVariantName } from './utils';
import Authenticator from './Authenticator';
import { MatchInfo } from './types';

/**
 * Match fetch request timer, in milliseconds.
 */
const UPDATE_INTERVAL_MS = 1000;

/**
 * @prop {string} name - Name of the player.
 * @prop {LobbyClient} lobbyClient - `LobbyClient` instance used to interact
 * with server match management API.
 * @func setMatchInfo - Callback to set match info.
 * @func setName - Callback to set name.
 * @func setErrorMessage - Callback to set error message.
 * @func clearErrorMessage - Callback to clear error message.
 */
interface LobbyProps {
  name: string;
  lobbyClient: LobbyClient;
  setMatchInfo: (matchInfo: MatchInfo) => void;
  setName: (name: string) => void;
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
}

/**
 * @prop {boolean} connected - Whether the client is connected to the server.
 * @prop {Match[]|null} matches - List of current matches hosted on the server.
 * @prop {number} numPlayers - Number of players for the match.
 * @prop {Expansion} expansion - Expansion to play.
 * @prop {SupplyVariant} supplyVariant - Supply variant to use.
 */
interface LobbyState {
  connected: boolean;
  matches: LobbyAPI.Match[] | null; // null means no matches fetched
  numPlayers: number;
  expansion: Expansion;
  supplyVariant: SupplyVariant;
}

/**
 * @prop {Timeout} fetchInterval - Interval timer for fetching matches.
 * @prop {Authenticator} authenticator - Manages local credential storage and retrieval.
 * @prop {RefObject} nameRef - Reference to the name input element.
 * @prop {RefObject} numPlayersRef - Reference to the number of players select element.
 * @prop {RefObject} expansionRef - Reference to the expansion select element.
 * @prop {RefObject} supplyVariantRef - Reference to the supply variant select element.
 */
export default class Lobby extends React.Component<LobbyProps, LobbyState> {
  private fetchInterval?: NodeJS.Timeout;
  private authenticator: Authenticator;

  private nameRef: React.RefObject<HTMLInputElement>;
  private numPlayersRef: React.RefObject<HTMLSelectElement>;
  private expansionRef: React.RefObject<HTMLSelectElement>;
  private supplyVariantRef: React.RefObject<HTMLSelectElement>;

  constructor(props: LobbyProps) {
    super(props);
    this.state = {
      connected: false,
      matches: null,
      // default values for new game
      numPlayers: 4,
      expansion: Expansion.Harbor,
      supplyVariant: SupplyVariant.Hybrid,
    };
    this.authenticator = new Authenticator();
    this.nameRef = React.createRef();
    this.numPlayersRef = React.createRef();
    this.expansionRef = React.createRef();
    this.supplyVariantRef = React.createRef();
  }

  setName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.setName(e.target.value);
  };

  setNumPlayers = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ numPlayers: parseInt(e.target.value) });
  };

  setExpansion = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ expansion: e.target.value as Expansion });
  };

  setSupplyVariant = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ supplyVariant: e.target.value as SupplyVariant });
  };

  // --- Fetch matches --------------------------------------------------------

  /**
   * Fetch available matches from the server. Updates render if the fetched
   * list differs from the list currently displayed.
   */
  fetchMatches = async (): Promise<void> => {
    const { lobbyClient } = this.props;
    const { connected, matches } = this.state;

    // try to fetch matches
    let newMatchList: LobbyAPI.MatchList;
    try {
      newMatchList = await lobbyClient.listMatches(GAME_NAME);
    } catch (e) {
      // we could not connect to the server
      if (window.location.protocol === 'https:') {
        // common reason is that HTTPS is not supported yet
        this.props.setErrorMessage('You must connect with `http` instead of `https`.');
      } else {
        this.props.setErrorMessage('Connecting to server...');
      }
      this.setState({ connected: false, matches: null });
      console.error('(fetchMatch)', e);
      return;
    }

    // if we were not connected before, clear the error message
    if (!connected) {
      this.props.clearErrorMessage();
      this.setState({ connected: true });
    }
    // if match list is different, update
    if (!_.isEqual(newMatchList.matches, matches)) {
      this.setState({ matches: newMatchList.matches });
    }
  };

  // --- Match management -----------------------------------------------------

  /**
   * Create a match based on the selected options.
   */
  createMatch = async (): Promise<void> => {
    const { lobbyClient } = this.props;
    const { connected, numPlayers, expansion, supplyVariant } = this.state;

    if (!connected || !this.validateName()) {
      return;
    }

    // create match
    const setupData: SetupData = {
      expansion,
      supplyVariant,
      startCoins: 3,
      randomizeTurnOrder: true,
    };

    // try to create a match
    let createdMatch: LobbyAPI.CreatedMatch;
    try {
      createdMatch = await lobbyClient.createMatch(GAME_NAME, { numPlayers, setupData });
    } catch (e) {
      this.props.setErrorMessage('Error when creating match. Try again.');
      console.error('(createMatch)', e);
      return;
    }

    console.log(`Created match '${createdMatch.matchID}'.`);
    // after creating the match, try to join
    await this.joinMatch(createdMatch.matchID);
  };

  /**
   * Join the match corresponding to `matchID`.
   * @param matchID
   */
  joinMatch = async (matchID: string): Promise<void> => {
    const { connected } = this.state;

    if (!connected) {
      return;
    }

    // try to join the match
    let matchInfo: MatchInfo;
    if (this.authenticator.hasMatchInfo(matchID) || (await this.joinMatchNoCredentials(matchID))) {
      matchInfo = this.authenticator.fetchMatchInfo(matchID)!;
    } else {
      // specific error messages should have been displayed, so no feedback is needed here
      return;
    }

    // this will trigger `Matchmaker` to switch to the waiting room
    this.props.setMatchInfo(matchInfo);
  };

  /**
   * Join a match by creating new credentials.
   * @param matchID
   * @returns True on success, false on failure.
   */
  joinMatchNoCredentials = async (matchID: string): Promise<boolean> => {
    const { name, lobbyClient } = this.props;
    const { connected } = this.state;

    if (!connected || !this.validateName()) {
      return false;
    }

    let match: LobbyAPI.Match;
    try {
      match = await lobbyClient.getMatch(GAME_NAME, matchID);
    } catch (e) {
      this.props.setErrorMessage('Error when joining match. Try again.');
      console.error('(joinMatchNoCredentials)', e);
      return false;
    }

    let playerID: string | null = null;
    // look for an available seat
    for (let seat = 0; seat < match.players.length; seat++) {
      if (seatIsOccupied(match.players[seat])) {
        // if seat is occupied, check the player does not share same name
        if (match.players[seat].name === name) {
          this.props.setErrorMessage('Name already taken.');
          return false;
        }
      } else if (playerID === null) {
        // if haven't already found a seat, sit
        playerID = seat.toString();
      }
    }

    // check if could not find a seat
    if (playerID === null) {
      this.props.setErrorMessage('No free seats available.');
      return false;
    }

    // try to join match
    let joinedMatch: LobbyAPI.JoinedMatch;
    try {
      joinedMatch = await lobbyClient.joinMatch(GAME_NAME, matchID, { playerID, playerName: name });
    } catch (e) {
      this.props.setErrorMessage('Error when joining match. Try again.');
      console.error('(joinMatchNoCredentials)', e);
      return false;
    }
    this.authenticator.saveMatchInfo({ matchID, playerID, credentials: joinedMatch.playerCredentials });
    console.log(`Saved credentials for match '${matchID}', seat ${playerID}.`);
    return true;
  };

  // --- Helper ---------------------------------------------------------------

  /**
   * Check if entered name is valid. Sets error message if not.
   * @returns True if `this.props.name` is OK.
   */
  validateName = (): boolean => {
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
  };

  // --- React ----------------------------------------------------------------

  componentDidMount() {
    const { name } = this.props;
    const { numPlayers, expansion, supplyVariant } = this.state;

    console.log('Joined lobby.');
    this.props.clearErrorMessage();

    // set default values
    if (this.nameRef.current) {
      this.nameRef.current.value = name;
    }
    if (this.numPlayersRef.current) {
      this.numPlayersRef.current.value = numPlayers.toString();
    }
    if (this.expansionRef.current) {
      this.expansionRef.current.value = expansion.toString();
    }
    if (this.supplyVariantRef.current) {
      this.supplyVariantRef.current.value = supplyVariant.toString();
    }

    this.fetchMatches();
    this.fetchInterval = setInterval(this.fetchMatches, UPDATE_INTERVAL_MS);
  }

  componentWillUnmount() {
    console.log('Leaving lobby...');
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }
  }

  // --- Render ---------------------------------------------------------------

  renderMatchList(): JSX.Element[] {
    const { matches: matchList } = this.state;

    const tbody: JSX.Element[] = [];
    if (!matchList) {
      tbody.push(<div key={0}>Fetching matches...</div>);
    } else if (matchList.length === 0) {
      tbody.push(<div key={0}>No open matches.</div>);
    } else {
      for (let i = 0; i < matchList.length; i++) {
        const { matchID, players, setupData } = matchList[i];
        const numActivePlayers = countPlayers(players);
        const numPlayers = players.length;
        let button: JSX.Element | null;
        if (this.authenticator.hasMatchInfo(matchID)) {
          // Able to automatically join the room (e.g. joined before, but closed browser)
          button = (
            <button className='button' onClick={() => this.joinMatch(matchID)}>
              Rejoin
            </button>
          );
        } else if (numActivePlayers === numPlayers) {
          // Room is full
          button = null;
        } else {
          button = (
            <button className='button' onClick={() => this.joinMatch(matchID)}>
              Join
            </button>
          );
        }
        tbody.push(
          <div className='lobby-container' key={i}>
            <div className='lobby-div-col lobby-div-col-width'>
              <div className='lobby-div-row'>
                <b>Room ID: </b>
                {matchID}
              </div>
            </div>
            <div className='lobby-div-col lobby-div-col-width'>
              <div className='lobby-div-row'>{expansionName(setupData.expansion)}</div>
              <div className='lobby-div-row'>{supplyVariantName(setupData.supplyVariant)}</div>
            </div>
            <div className='lobby-div-col lobby-div-col-width'>
              <div className='lobby-div-row'>
                {numActivePlayers} / {numPlayers} players
              </div>
              <div className='lobby-div-row'>
                {Array(numActivePlayers).fill('X')}
                {Array(numPlayers - numActivePlayers).fill('O')}
              </div>
            </div>
            <div className='lobby-div-col'>{button}</div>
          </div>
        );
      }
    }
    return tbody;
  }

  render() {
    return (
      <div>
        <div className='padded_div'>
          <span>Enter Player Name: </span>
          <input
            className='input-box'
            ref={this.nameRef}
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
          <select ref={this.numPlayersRef} onChange={this.setNumPlayers}>
            <option value='2'>2 Players</option>
            <option value='3'>3 Players</option>
            <option value='4'>4 Players</option>
            <option value='5'>5 Players</option>
          </select>
          <select ref={this.expansionRef} onChange={this.setExpansion}>
            <option value={Expansion.Harbor}>{expansionName(Expansion.Harbor)}</option>
            <option value={Expansion.Base}>{expansionName(Expansion.Base)}</option>
          </select>
          <select ref={this.supplyVariantRef} onChange={this.setSupplyVariant}>
            <option value={SupplyVariant.Hybrid}>{supplyVariantName(SupplyVariant.Hybrid)}</option>
            <option value={SupplyVariant.Variable}>{supplyVariantName(SupplyVariant.Variable)}</option>
            <option value={SupplyVariant.Total}>{supplyVariantName(SupplyVariant.Total)}</option>
          </select>
          <button className='button' onClick={this.createMatch}>
            Create Room
          </button>
        </div>
        <div className='padded_div'>
          <span className='subtitle'>Lobby</span>
          <div>{this.renderMatchList()}</div>
        </div>
      </div>
    );
  }
}
