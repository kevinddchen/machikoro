import 'styles/main.css';

import { LobbyAPI } from 'boardgame.io';
import { LobbyClient } from 'boardgame.io/client';
import React from 'react';
import { Server } from 'boardgame.io';

import { Expansion, GAME_NAME, SetupData, SupplyVariant, Version, displayName, supplyVariantName } from 'game';
import { FETCH_INTERVAL_MS, FETCH_TIMEOUT_MS } from 'common/config';
import { asyncCallWithTimeout, defaultErrorCatcher } from 'common/async';

import Authenticator from './Authenticator';
import { MatchInfo } from './types';
import { countPlayers } from './utils';

/**
 * @prop {string} name - Name of the player.
 * @prop {LobbyClient} lobbyClient - `LobbyClient` instance used to interact
 * with server match management API.
 * @prop {MatchInfo} matchInfo - Information a client needs to connect to a match.
 * @func clearMatchInfo - Callback to clear match info.
 * @func startMatch - Callback to start match.
 * @func setErrorMessage - Callback to set error message.
 * @func clearErrorMessage - Callback to clear error message.
 */
interface RoomProps {
  name: string;
  lobbyClient: LobbyClient;
  matchInfo: MatchInfo;
  clearMatchInfo: () => void;
  startMatch: () => void;
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
}

/**
 * @prop {string} name - Name of the player.
 * @prop {PlayerMetadata[]} players - List of metadata for players in the room.
 * @prop {Version|null} version - Version to play. This is initially null, but is fetched.
 * @prop {Expansion[]|null} expansions - Expansions to play. This is initially null, but is fetched.
 * @prop {SupplyVariant|null} supplyVariant - Supply variant to use. This is initially null, but is fetched.
 */
interface RoomState {
  connected: boolean;
  players: Server.PlayerMetadata[];
  version: Version | null;
  expansions: Expansion[] | null;
  supplyVariant: SupplyVariant | null;
}

/**
 * @prop {Timeout} fetchInterval - Interval timer for fetching matches.
 * @prop {Authenticator} authenticator - Manages local credential storage and retrieval.
 */
export default class Room extends React.Component<RoomProps, RoomState> {
  private fetchInterval?: NodeJS.Timeout;
  private authenticator: Authenticator;

  constructor(props: RoomProps) {
    super(props);
    this.state = {
      connected: false,
      players: [],
      version: null,
      expansions: null,
      supplyVariant: null,
    };
    this.authenticator = new Authenticator();
  }

  // --- Methods --------------------------------------------------------------

  /**
   * Fetches list of players from the server. Connectivity is determined by
   * whether of not this function successfully fetches information from the
   * server. Also automatically starts the game when there are enough people.
   */
  private fetchMatch = async (): Promise<void> => {
    const { matchInfo, lobbyClient } = this.props;
    const { connected } = this.state;

    // try to fetch match information
    let match: LobbyAPI.Match;
    try {
      match = await lobbyClient.getMatch(GAME_NAME, matchInfo.matchID);
    } catch (e) {
      this.props.setErrorMessage('Failed to connect to server');
      this.setState({ connected: false });
      throw e;
    }

    // if seats are all full, start match now
    if (countPlayers(match.players) === match.players.length) {
      this.props.startMatch();
    }

    // if we were not connected before, clear the error message
    if (!connected) {
      this.props.clearErrorMessage();
      this.setState({ connected: true });
    }

    const { version, expansions, supplyVariant } = match.setupData as SetupData;
    this.setState({ players: match.players, version, expansions, supplyVariant });
  };

  /**
   * Leave the match and delete credentials.
   */
  private leaveMatch = async (): Promise<void> => {
    const { matchInfo, lobbyClient } = this.props;
    const { matchID, playerID, credentials } = matchInfo;
    const { connected } = this.state;

    if (!connected) {
      throw new Error('Cannot leave match: Not connected to server.');
    }

    try {
      await lobbyClient.leaveMatch(GAME_NAME, matchID, {
        playerID,
        credentials,
      });
    } catch (e) {
      this.props.setErrorMessage('Error when leaving match. Try again.');
      throw e;
    }

    this.authenticator.deleteMatchInfo(matchID);

    // this will trigger `Matchmaker` to switch to the lobby
    this.props.clearMatchInfo();
  };

  // --- React -----------------------------------------------------------------

  componentDidMount() {
    this.props.clearErrorMessage();

    // create callback for fetching match information that runs periodically
    const callback = () => {
      asyncCallWithTimeout(this.fetchMatch(), FETCH_TIMEOUT_MS).catch(defaultErrorCatcher);
    };

    callback();
    this.fetchInterval = setInterval(callback, FETCH_INTERVAL_MS);
  }

  componentWillUnmount() {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }
  }

  // --- Render ----------------------------------------------------------------

  /**
   * @returns Elements displaying player names.
   */
  private renderPlayers = (): JSX.Element[] => {
    const { matchInfo } = this.props;
    const { players } = this.state;

    const tbody: JSX.Element[] = [];
    for (let seat = 0; seat < players.length; seat++) {
      const { id, name } = players[seat];

      let indicator = 'mm-td';
      let button: JSX.Element | null = null;

      // If the element corresponds to the client, add a leave button.
      if (id.toString() === matchInfo.playerID) {
        indicator = 'mm-td mm-td-active'; /* use css as indicator */
        button = (
          <button
            className='button'
            onClick={() => {
              this.leaveMatch().catch(defaultErrorCatcher);
            }}
          >
            Leave
          </button>
        );
      }

      tbody.push(
        <td className={indicator} key={seat}>
          {seat + 1}: {name} <br /> {button}
        </td>
      );
    }
    return tbody;
  };

  render() {
    const { matchInfo } = this.props;
    const { version, expansions, supplyVariant } = this.state;

    return (
      <div>
        <br />
        <div className='mm-container'>
          <div className='mm-div-row'>
            <div className='mm-div-cell'>
              <b>Room ID:</b> {matchInfo.matchID}
            </div>
            <div className='mm-div-cell'>
              <b>{displayName(version, expansions)}</b>
            </div>
            <div className='mm-div-cell'>
              <b>{supplyVariantName(supplyVariant)}</b>
            </div>
          </div>
          <div className='mm-div-row'>Game will start when all seats are filled.</div>
          <div className='mm-div-row'>
            <div className='mm-div-cell'>
              <b>Players</b>
              <br />
              <table className='mm-table'>
                <tbody>
                  <tr>{this.renderPlayers()}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
