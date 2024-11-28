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
  displayName,
  supplyVariantName,
  versionName,
} from 'game';

import { FETCH_INTERVAL_MS, FETCH_TIMEOUT_MS } from 'common/config';
import { asyncCallWithTimeout, defaultErrorCatcher } from 'common/async';
import { createMatchAPI, joinMatchAPI } from 'server/api';

import { countPlayers, hasDetails } from './utils';
import Authenticator from './Authenticator';
import { MatchInfo } from './types';

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
 * @prop {Version} version - Version to play.
 * @prop {boolean} useHarborExp - Whether to use the harbor expansion.
 * @prop {boolean} useMillionExp - Whether to use the millionaire's row expansion.
 * @prop {SupplyVariant} supplyVariant - Supply variant to use.
 */
interface LobbyState {
  connected: boolean;
  matches: LobbyAPI.Match[] | null; // null means no matches fetched
  numPlayers: number;
  version: Version;
  useHarborExp: boolean;
  useMillionExp: boolean;
  supplyVariant: SupplyVariant;
}

/**
 * @prop {Timeout} fetchInterval - Interval timer for fetching matches.
 * @prop {Authenticator} authenticator - Manages local credential storage and retrieval.
 * @prop {RefObject} nameRef - Reference to the name input element.
 * @prop {RefObject} numPlayersRef - Reference to the number of players select element.
 * @prop {RefObject} harborExpRef - Reference to the harbor expansion checkbox element.
 * @prop {RefObject} millionExpRef - Reference to the millionaire's row expansion checkbox element.
 * @prop {RefObject} supplyVariantRef - Reference to the supply variant select element.
 */
export default class Lobby extends React.Component<LobbyProps, LobbyState> {
  private fetchInterval?: NodeJS.Timeout;
  private authenticator: Authenticator;

  private nameRef: React.RefObject<HTMLInputElement>;
  private numPlayersRef: React.RefObject<HTMLSelectElement>;
  private versionRef: React.RefObject<HTMLSelectElement>;
  private harborExpRef: React.RefObject<HTMLInputElement>;
  private millionExpRef: React.RefObject<HTMLInputElement>;
  private supplyVariantRef: React.RefObject<HTMLSelectElement>;

  constructor(props: LobbyProps) {
    super(props);
    this.state = {
      connected: false,
      matches: null,
      // default values for new game
      numPlayers: 2,
      version: Version.MK1,
      useHarborExp: false,
      useMillionExp: false,
      supplyVariant: SupplyVariant.Hybrid,
    };
    this.authenticator = new Authenticator();
    this.nameRef = React.createRef();
    this.numPlayersRef = React.createRef();
    this.versionRef = React.createRef();
    this.harborExpRef = React.createRef();
    this.millionExpRef = React.createRef();
    this.supplyVariantRef = React.createRef();
  }

  private setName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.setName(e.target.value);
  };

  private setNumPlayers = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ numPlayers: parseInt(e.target.value) });
  };

  private setVersion = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const version = parseInt(e.target.value) as Version;
    this.setState({ version: parseInt(e.target.value) as Version });
    if (version === Version.MK2) {
      // disable expansions for Machi Koro 2
      this.setState({ useHarborExp: false, useMillionExp: false });
      // uncheck the boxes
      if (this.harborExpRef.current) {
        this.harborExpRef.current.checked = false;
      }
      if (this.millionExpRef.current) {
        this.millionExpRef.current.checked = false;
      }
    }
  };

  private toggleHarborExp = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ useHarborExp: e.target.checked });
  };

  private toggleMillionExp = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ useMillionExp: e.target.checked });
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
    const { connected, numPlayers, version, useHarborExp, useMillionExp, supplyVariant } = this.state;

    if (!connected) {
      throw new Error('Cannot create match: Not connected to server.');
    }

    // initialize setup data
    let startCoins;
    let initialBuyRounds;
    switch (version) {
      case Version.MK1: {
        startCoins = MK1_STARTING_COINS;
        initialBuyRounds = 0;
        break;
      }
      case Version.MK2: {
        startCoins = MK2_STARTING_COINS;
        initialBuyRounds = MK2_INITIAL_BUY_ROUNDS;
        break;
      }
    }

    const expansions: Expansion[] = [Expansion.Base];
    if (useHarborExp) {
      expansions.push(Expansion.Harbor);
    }
    if (useMillionExp) {
      expansions.push(Expansion.Million);
    }

    const setupData: SetupData = {
      version,
      expansions,
      supplyVariant,
      startCoins,
      initialBuyRounds,
      randomizeTurnOrder: true,
    };

    // try to create a match
    const createMatchRequest: createMatchAPI = {
      playerName: name,
      numPlayers,
      setupData,
    };

    let createdMatch: LobbyAPI.CreatedMatch;
    try {
      createdMatch = await lobbyClient.createMatch(GAME_NAME, createMatchRequest);
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
    const fetchedMatchInfo = this.authenticator.fetchMatchInfo(matchID);
    if (fetchedMatchInfo !== null) {
      this.props.setMatchInfo(fetchedMatchInfo);
      // this will trigger `Matchmaker` to switch to the waiting room
      return;
    }

    // second, try to join the match by creating new credentials
    const joinMatchRequest: joinMatchAPI = {
      playerName: name,
    };

    let joinedMatch: LobbyAPI.JoinedMatch;
    try {
      joinedMatch = await lobbyClient.joinMatch(GAME_NAME, matchID, joinMatchRequest);
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
    const { numPlayers, version, useHarborExp, useMillionExp, supplyVariant } = this.state;

    this.props.clearErrorMessage();

    // set default values
    if (this.nameRef.current) {
      this.nameRef.current.value = name;
    }
    if (this.numPlayersRef.current) {
      this.numPlayersRef.current.value = numPlayers.toString();
    }
    if (this.versionRef.current) {
      this.versionRef.current.value = version.toString();
    }
    if (this.harborExpRef.current) {
      this.harborExpRef.current.checked = useHarborExp;
    }
    if (this.millionExpRef.current) {
      this.millionExpRef.current.checked = useMillionExp;
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
  private renderPlayerName = (): React.JSX.Element => {
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
  private renderCreateMatch = (): React.JSX.Element => {
    // prettier-ignore
    const numPlayersOptions =
      <select ref={this.numPlayersRef} onChange={this.setNumPlayers}>
        <option key='0' value='2'>2 Players</option>,
        <option key='1' value='3'>3 Players</option>,
        <option key='2' value='4'>4 Players</option>,
        <option key='3' value='5'>5 Players</option>,
      </select>

    // prettier-ignore
    const versionOptions =
      <select ref={this.versionRef} onChange={this.setVersion}>
        <option key='0' value={Version.MK1.toString()}>{versionName(Version.MK1)}</option>
        <option key='1' value={Version.MK2.toString()}>{versionName(Version.MK2)}</option>
      </select>

    // expansions cannot be toggled for Machi Koro 2
    const expansionOptionsDisabled = this.state.version === Version.MK2;
    const expansionOptions = (
      <div style={{ textAlign: 'left' }}>
        <input
          key='0'
          type='checkbox'
          ref={this.harborExpRef}
          onChange={this.toggleHarborExp}
          disabled={expansionOptionsDisabled}
        />
        Harbor
        <br />
        <input
          key='1'
          type='checkbox'
          ref={this.millionExpRef}
          onChange={this.toggleMillionExp}
          disabled={expansionOptionsDisabled}
        />
        {"Millionaire's Row"}
      </div>
    );

    // prettier-ignore
    const supplyVariantOptions =
      <select ref={this.supplyVariantRef} onChange={this.setSupplyVariant}>
        <option key='0' value={SupplyVariant.Hybrid}>{supplyVariantName(SupplyVariant.Hybrid)}</option>,
        <option key='1' value={SupplyVariant.Variable}>{supplyVariantName(SupplyVariant.Variable)}</option>,
        <option key='2' value={SupplyVariant.Total}>{supplyVariantName(SupplyVariant.Total)}</option>
      </select>

    return (
      <div className='padded_div'>
        <span className='subtitle'>Create Room</span>
        <br />
        <div className='div-inline-flex'>
          {versionOptions}
          {expansionOptions}
          {supplyVariantOptions}
          {numPlayersOptions}
          <button
            className='button'
            onClick={() => {
              this.createAndJoinMatch().catch(defaultErrorCatcher);
            }}
          >
            Create Room
          </button>
        </div>
      </div>
    );
  };

  /**
   * @returns Elements displaying available matches.
   */
  private renderMatches = (): React.JSX.Element => {
    let { matches } = this.state;

    const tbody: React.JSX.Element[] = [];

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
        let button: React.JSX.Element | null = null;
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
              <div className='lobby-div-row'>{displayName(setupData.version, setupData.expansions)}</div>
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
          </div>,
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
