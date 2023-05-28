import 'styles/main.css';

import { LobbyAPI } from 'boardgame.io';
import { LobbyClient } from 'boardgame.io/client';
import React from 'react';

import {
  Expansion,
  GAME_NAME,
  MK1_STARTING_COINS,
  MK2_INITIAL_BUY_ROUNDS,
  MK2_STARTING_COINS,
  SetupData,
  SupplyVariant,
  Version,
  expToVer,
} from 'game';

import { FETCH_INTERVAL_MS, FETCH_TIMEOUT_MS } from 'common/config';
import { assertNonNull, assertUnreachable } from 'common/typescript';
import { asyncCallWithTimeout, defaultErrorCatcher } from 'common/async';

import { countPlayers, expansionName, hasDetails, supplyVariantName } from './utils';
import Authenticator from './Authenticator';
import { MatchInfo } from './types';

/**
 * HTTP request body for creating a match.
 * @prop {string} playerName - Name of the player. This is not needed by
 * boardgame.io's API, but we add middleware to validate the player name.
 * @prop {number} numPlayers
 * @prop {SetupData} setupData
 */
export interface createMatchBody {
  playerName: string;
  numPlayers: number;
  setupData: SetupData;
}

/**
 * HTTP request body for joining a match.
 * @prop {string} playerName
 */
export interface joinMatchBody {
  playerName: string;
}

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
      numPlayers: 2,
      expansion: Expansion.Base,
      supplyVariant: SupplyVariant.Hybrid,
    };
    this.authenticator = new Authenticator();
    this.nameRef = React.createRef();
    this.numPlayersRef = React.createRef();
    this.expansionRef = React.createRef();
    this.supplyVariantRef = React.createRef();
  }

  private setName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.setName(e.target.value);
  };

  private setNumPlayers = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ numPlayers: parseInt(e.target.value) });
  };

  private setExpansion = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ expansion: e.target.value as Expansion });
  };

  private setSupplyVariant = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ supplyVariant: e.target.value as SupplyVariant });
  };

  // --- Methods --------------------------------------------------------------

  /**
   * Fetch available matches from the server and update the component state.
   * Connectivity is determined by whether of not this function successfully
   * fetches information from the server.
   */
  private fetchMatches = async (): Promise<void> => {
    const { lobbyClient } = this.props;
    const { connected } = this.state;

    // try to fetch matches
    let matchList: LobbyAPI.MatchList;
    try {
      matchList = await lobbyClient.listMatches(GAME_NAME, { isGameover: false });
    } catch (e) {
      this.props.setErrorMessage('Failed to connect to server');
      this.setState({ connected: false });
      throw e;
    }

    // if we were not connected before, clear the error message
    if (!connected) {
      this.props.clearErrorMessage();
      this.setState({ connected: true });
    }

    this.setState({ matches: matchList.matches });
  };

  /**
   * Create a match based on the selected options.
   * @returns The match ID of the created match.
   */
  private createMatch = async (): Promise<string> => {
    const { name, lobbyClient } = this.props;
    const { connected, numPlayers, expansion, supplyVariant } = this.state;

    if (!connected) {
      throw new Error('Cannot create match: Not connected to server.');
    }

    // initialize setup data
    let startCoins;
    let initialBuyRounds;
    const version = expToVer(expansion);
    if (version === Version.MK1) {
      startCoins = MK1_STARTING_COINS;
      initialBuyRounds = 0;
    } else if (version === Version.MK2) {
      startCoins = MK2_STARTING_COINS;
      initialBuyRounds = MK2_INITIAL_BUY_ROUNDS;
    } else {
      return assertUnreachable(version);
    }

    const setupData: SetupData = {
      expansion,
      supplyVariant,
      startCoins,
      initialBuyRounds,
      randomizeTurnOrder: true,
    };

    // try to create a match
    let createdMatch: LobbyAPI.CreatedMatch;
    try {
      createdMatch = await lobbyClient.createMatch(GAME_NAME, {
        playerName: name,
        numPlayers,
        setupData,
      } as createMatchBody);
    } catch (e) {
      if (hasDetails(e)) {
        // if error has specific reason, display it
        this.props.setErrorMessage(e.details);
      } else {
        this.props.setErrorMessage('Error when creating match. Try again.');
      }
      throw e;
    }

    return createdMatch.matchID;
  };

  /**
   * Join the match corresponding to `matchID`.
   * @param matchID
   */
  private joinMatch = async (matchID: string): Promise<void> => {
    const { name, lobbyClient } = this.props;
    const { connected } = this.state;

    if (!connected) {
      throw new Error('Cannot join match: Not connected to server.');
    }

    // first, try to join the match on saved credentials
    if (this.authenticator.hasMatchInfo(matchID)) {
      const matchInfo = this.authenticator.fetchMatchInfo(matchID);
      assertNonNull(matchInfo);
      this.props.setMatchInfo(matchInfo);
      // this will trigger `Matchmaker` to switch to the waiting room
      return;
    }

    // second, try to join the match by creating new credentials
    let joinedMatch: LobbyAPI.JoinedMatch;
    try {
      joinedMatch = await lobbyClient.joinMatch(GAME_NAME, matchID, { playerName: name } as joinMatchBody);
    } catch (e) {
      if (hasDetails(e)) {
        // if error has specific reason, display it
        this.props.setErrorMessage(e.details);
      } else {
        this.props.setErrorMessage('Error when joining match. Try again.');
      }
      throw e;
    }

    const { playerID, playerCredentials: credentials } = joinedMatch;
    const matchInfo: MatchInfo = { matchID, playerID, credentials };
    this.authenticator.saveMatchInfo(matchInfo);
    this.props.setMatchInfo(matchInfo);
    // this will trigger `Matchmaker` to switch to the waiting room
    return;
  };

  /**
   * Convenience function to create and join a match.
   */
  private createAndJoinMatch = async (): Promise<void> => {
    const matchID = await this.createMatch();
    await this.joinMatch(matchID);
  };

  /**
   * Spectate the match corresponding to `matchID`.
   * @param matchID
   */
  private spectateMatch = (matchID: string): void => {
    const { connected } = this.state;

    if (!connected) {
      throw new Error('Cannot spectate match: Not connected to server.');
    }

    const matchInfo: MatchInfo = { matchID, playerID: '', credentials: '' };
    this.props.setMatchInfo(matchInfo);
    // this will trigger `Matchmaker` to switch to the waiting room
    return;
  };

  // --- React ----------------------------------------------------------------

  componentDidMount() {
    const { name } = this.props;
    const { numPlayers, expansion, supplyVariant } = this.state;

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

    // create callback for fetching matches that runs periodically
    const callback = () => {
      asyncCallWithTimeout(this.fetchMatches(), FETCH_TIMEOUT_MS).catch(defaultErrorCatcher);
    };

    callback();
    this.fetchInterval = setInterval(callback, FETCH_INTERVAL_MS);
  }

  componentWillUnmount() {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }
  }

  // --- Render ---------------------------------------------------------------

  /**
   * @returns Elements for player name entry.
   */
  private renderPlayerName = (): JSX.Element => {
    return (
      <div className='padded_div'>
        <span>Enter Player Name: </span>
        <input
          className='input-box'
          ref={this.nameRef}
          type='text'
          spellCheck='false'
          autoComplete='off'
          onChange={this.setName}
        />
      </div>
    );
  };

  /**
   * @returns Elements for creating a new match.
   */
  private renderCreateMatch = (): JSX.Element => {
    // prettier-ignore
    const numPlayersOptions = [
      <option key='0' value='2'>2 Players</option>,
      <option key='1' value='3'>3 Players</option>,
      <option key='2' value='4'>4 Players</option>,
      <option key='3' value='5'>5 Players</option>,
    ];

    // prettier-ignore
    const expansionOptions = [
      <option key='0' value={Expansion.Base}>{expansionName(Expansion.Base)}</option>,
      <option key='1' value={Expansion.Harbor}>{expansionName(Expansion.Harbor)}</option>,
      <option key='2' value={Expansion.MK2}>{expansionName(Expansion.MK2)}</option>
    ];

    // prettier-ignore
    const supplyVariantOptions = [
      <option key='0' value={SupplyVariant.Hybrid}>{supplyVariantName(SupplyVariant.Hybrid)}</option>,
      <option key='1' value={SupplyVariant.Variable}>{supplyVariantName(SupplyVariant.Variable)}</option>,
      <option key='2' value={SupplyVariant.Total}>{supplyVariantName(SupplyVariant.Total)}</option>
    ];

    return (
      <div className='padded_div'>
        <span className='subtitle'>Create Room</span>
        <br />
        <select ref={this.numPlayersRef} onChange={this.setNumPlayers}>
          {numPlayersOptions}
        </select>
        <select ref={this.expansionRef} onChange={this.setExpansion}>
          {expansionOptions}
        </select>
        <select ref={this.supplyVariantRef} onChange={this.setSupplyVariant}>
          {supplyVariantOptions}
        </select>
        <button
          className='button'
          onClick={() => {
            this.createAndJoinMatch().catch(defaultErrorCatcher);
          }}
        >
          Create Room
        </button>
      </div>
    );
  };

  /**
   * @returns Elements displaying available matches.
   */
  private renderMatches = (): JSX.Element => {
    let { matches } = this.state;

    const tbody: JSX.Element[] = [];

    // Matches have not been fetched yet
    if (matches === null) {
      tbody.push(<div key={0}>Fetching matches...</div>);

      // No matches
    } else if (matches.length === 0) {
      tbody.push(<div key={0}>No open matches.</div>);

      // There are some matches
    } else {
      // first, sort matches so newer ones are first
      matches = sortMatches(matches);
      for (let i = 0; i < matches.length; i++) {
        const { matchID, players } = matches[i];
        const setupData = matches[i].setupData as SetupData;
        const numActivePlayers = countPlayers(players);
        const numPlayers = players.length;

        // Button to join the room
        let button: JSX.Element | null = null;
        if (this.authenticator.hasMatchInfo(matchID)) {
          // Able to rejoin the room (e.g. joined before, but closed browser)
          button = (
            <button
              className='button'
              onClick={() => {
                this.joinMatch(matchID).catch(defaultErrorCatcher);
              }}
            >
              Rejoin
            </button>
          );
        } else if (numActivePlayers === numPlayers) {
          // Room is full; can only spectate
          button = (
            <button
              className='button'
              onClick={() => {
                try {
                  this.spectateMatch(matchID);
                } catch (e) {
                  defaultErrorCatcher(e);
                }
              }}
            >
              Spectate
            </button>
          );
        } else {
          // Room is not full; able to join the room as new player
          button = (
            <button
              className='button'
              onClick={() => {
                this.joinMatch(matchID).catch(defaultErrorCatcher);
              }}
            >
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
                {Array.from({ length: numActivePlayers }, () => 'X')}
                {Array.from({ length: numPlayers - numActivePlayers }, () => 'O')}
              </div>
            </div>
            <div className='lobby-div-col'>{button}</div>
          </div>
        );
      }
    }

    return (
      <div className='padded_div'>
        <span className='subtitle'>Lobby</span>
        <div>{tbody}</div>
      </div>
    );
  };

  render() {
    return (
      <div>
        <div>{this.renderPlayerName()}</div>
        <div>{this.renderCreateMatch()}</div>
        <div>{this.renderMatches()}</div>
      </div>
    );
  }
}

/**
 * Sort matches so newer matches are first.
 * @param matches
 * @returns
 */
const sortMatches = (matches: LobbyAPI.Match[]): LobbyAPI.Match[] => {
  return matches.sort((a, b) => b.createdAt - a.createdAt);
};
