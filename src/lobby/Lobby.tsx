import 'styles/main.css';

import _ from 'lodash';
import React from 'react';
import { LobbyAPI } from 'boardgame.io';
import { LobbyClient } from 'boardgame.io/client';

import Authenticator from './Authenticator';
import { UPDATE_INTERVAL } from 'config';
import { GAME_NAME, Expansion, SupplyVariant } from 'game';
import { ClientInfo } from './types';
import { seatIsOccupied, countPlayers, expansionName, supplyVariantName } from './utils';

/**
 * @param name Name of the player.
 * @param lobbyClient LobbyClient instance used to interact with server match management API
 * @param setClientInfo Callback to set client info.
 * @param setName Callback to set name.
 * @param setErrorMessage Callback to set error message.
 * @param clearErrorMessage Callback to clear error message.
 */
interface LobbyProps {
  name: string;
  lobbyClient: LobbyClient;
  setClientInfo: (clientInfo: ClientInfo) => void; 
  setName: (name: string) => void;
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
}

/**
 * @param numPlayers Number of players for the match.
 * @param expansion Expansion to play.
 * @param supplyVariant Supply variant to use.
 * @param matchList List of current matches hosted on the server.
 */
interface LobbyState {
  numPlayers: number;
  expansion: Expansion;
  supplyVariant: SupplyVariant;
  matchList?: LobbyAPI.Match[];
}

/**
 * Create game lobby. Handles match creation and joining.
 */
export default class Lobby extends React.Component<LobbyProps, LobbyState> {

  private fetchInterval?: NodeJS.Timeout;
  private authenticator: Authenticator; // manages local credential storage and retrieval

  private nameRef: React.RefObject<HTMLInputElement>;
  private numPlayersRef: React.RefObject<HTMLSelectElement>;
  private expansionRef: React.RefObject<HTMLSelectElement>;
  private supplyVariantRef: React.RefObject<HTMLSelectElement>;

  constructor (props: LobbyProps) {
    super(props);
    this.state = { // default values we start with
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
    this.setState({ expansion: parseInt(e.target.value) });
  };

  setSupplyVariant = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ supplyVariant: parseInt(e.target.value) });
  };

  // --- Fetch matches --------------------------------------------------------

  /**
   * Fetch available matches from the server. Updates render if the fetched
   * list differes from the list currently displayed.
   */
  fetchMatches = async (): Promise<void> => {
    const { lobbyClient } = this.props;
    const { matchList } = this.state;

    try {
      const { matches } = await lobbyClient.listMatches(GAME_NAME);
      if (!_.isEqual(matches, matchList)) {
        this.setState({ matchList: matches });
      }
    } catch (e) {
      // The server currently does not allow https connections
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
  createMatch = async (): Promise<void> => {
    const { lobbyClient } = this.props;
    const { numPlayers, expansion, supplyVariant } = this.state;

    if (!this.validateName()) {
      return;
    }

    try {
      // create match
      const { matchID } = await lobbyClient.createMatch(
        GAME_NAME, 
        {
          numPlayers,
          setupData: { expansion, supplyVariant, startCoins: 3, randomizeTurnOrder: true }
        },
      );
      console.log(`Created match '${matchID}'.`);
      // after creating the match, try to join
      await this.joinMatch(matchID);
    } catch (e) {
      this.props.setErrorMessage('Error when creating match. Try again.');
      console.error('(createMatch)', e);
    }
  };

  /**
   * Join the match corresponding to `matchID`.
   * @param matchID
   */
  joinMatch = async (matchID: string): Promise<void> => {
    try {
      if (this.authenticator.hasCredentials(matchID) || await this.joinMatchNoCredentials(matchID)) {
        const { playerID, credentials } = this.authenticator.fetchCredentials(matchID);
        if (playerID && credentials)
          this.props.setClientInfo({ matchID, playerID, credentials });
        // TODO: what happens if credentials are no good?
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
   * @param matchID
   * @returns True on success, false on failure.
   */
  joinMatchNoCredentials = async (matchID: string): Promise<boolean> => {
    const { name, lobbyClient } = this.props;

    if (!this.validateName()) {
      return false;
    }

    const match = await lobbyClient.getMatch(GAME_NAME, matchID);
    let playerID: string | null = null;
    // look for an available seat
    for (let seat = 0; seat < match.players.length; seat++) {
      if (seatIsOccupied(match.players[seat])) {
        // if seat is occupied, check the player does not share same name
        if (match.players[seat].name === name) {
          this.props.setErrorMessage('Name already taken.');
          return false;
        }
      } else if (!playerID) {
        // if haven't already found a seat, sit
        playerID = seat.toString();
      }
    }

    // check if could not find a seat
    if (!playerID) {
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
  }

  // --- React ----------------------------------------------------------------

  componentDidMount () {
    const { name } = this.props;
    const { numPlayers, expansion, supplyVariant } = this.state;

    console.log('Joined lobby.');
    this.props.clearErrorMessage();

    // set default values
    if (this.nameRef.current)
      this.nameRef.current.value = name;
    if (this.numPlayersRef.current)
      this.numPlayersRef.current.value = numPlayers.toString();
    if (this.expansionRef.current)
      this.expansionRef.current.value = expansion.toString();
    if (this.supplyVariantRef.current)
      this.supplyVariantRef.current.value = supplyVariant.toString();

    this.fetchMatches();
    this.fetchInterval = setInterval(this.fetchMatches, UPDATE_INTERVAL);
  }

  componentWillUnmount () {
    console.log('Leaving lobby...');
    if (this.fetchInterval)
      clearInterval(this.fetchInterval);
  }

  // --- Render ---------------------------------------------------------------

  renderMatchList (): JSX.Element[] {
    const { matchList } = this.state;

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
        let button: any;
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
