import 'styles/main.css';

import { LobbyAPI } from 'boardgame.io';
import { LobbyClient } from 'boardgame.io/client';
import React from 'react';
import { Server } from 'boardgame.io';
import _ from 'lodash';

import { Expansion, GAME_NAME, SupplyVariant } from 'game';
import { countPlayers, expansionName, supplyVariantName } from './utils';
import Authenticator from './Authenticator';
import { MatchInfo } from './types';

/**
 * @prop {string} name - Name of the player.
 * @prop {LobbyClient} lobbyClient - `LobbyClient` instance used to interact
 * with server match management API.
 * @prop {number} updateIntervalMs - Match fetch request timer, in milliseconds.
 * @prop {MatchInfo} matchInfo - Information a client needs to connect to a match.
 * @func clearMatchInfo - Callback to clear match info.
 * @func startMatch - Callback to start match.
 * @func setErrorMessage - Callback to set error message.
 * @func clearErrorMessage - Callback to clear error message.
 */
interface RoomProps {
  name: string;
  lobbyClient: LobbyClient;
  updateIntervalMs: number;
  matchInfo: MatchInfo;
  clearMatchInfo: () => void;
  startMatch: () => void;
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
}

/**
 * @prop {string} name - Name of the player.
 * @prop {PlayerMetadata[]} players - List of metadata for players in the room.
 * @prop {Expansion|null} expansion - Expansion to play. This is initially null, but is fetched.
 * @prop {SupplyVariant|null} supplyVariant - Supply variant to use. This is initially null, but is fetched.
 */
interface RoomState {
  connected: boolean;
  players: Server.PlayerMetadata[];
  expansion: Expansion | null;
  supplyVariant: SupplyVariant | null;
}

/**
 * @prop {Timeout} fetchInterval - Interval timer for fetching matches.
 * @prop {Authenticator} authenticator - Manages local credential storage and retrieval.
 */
export default class Room extends React.Component<RoomProps, RoomState> {
  private fetchInterval?: NodeJS.Timeout;
  private authenticator: Authenticator;

  static defaultProps = {
    updateIntervalMs: 1000,
  };

  constructor(props: RoomProps) {
    super(props);
    this.state = {
      connected: false,
      players: [],
      expansion: null,
      supplyVariant: null,
    };
    this.authenticator = new Authenticator();
  }

  // --- Methods --------------------------------------------------------------

  /**
   * Fetches list of players from the server. Also automatically starts the
   * game when there are enough people.
   */
  private fetchMatch = async (): Promise<void> => {
    const { matchInfo, lobbyClient } = this.props;
    const { connected, players } = this.state;

    let match: LobbyAPI.Match;
    try {
      match = await lobbyClient.getMatch(GAME_NAME, matchInfo.matchID);
    } catch (e) {
      this.props.setErrorMessage('Connecting to server...');
      this.setState({ connected: false });
      console.error('(fetchMatch)', e);
      return;
    }

    // if we were not connected before, clear the error message
    if (!connected) {
      this.props.clearErrorMessage();
      this.setState({ connected: true });
    }
    // if player list has changed, update state
    if (!_.isEqual(match.players, players)) {
      const { expansion, supplyVariant } = match.setupData;
      this.setState({ players: match.players, expansion, supplyVariant });
      // if seats are all full, start match now
      if (countPlayers(match.players) === match.players.length) {
        this.props.startMatch();
      }
    }
  };

  /**
   * Leave the match and delete credentials.
   */
  private leaveMatch = async (): Promise<void> => {
    const { matchInfo, lobbyClient } = this.props;
    const { matchID, playerID, credentials } = matchInfo;
    const { connected } = this.state;

    if (!connected) {
      return;
    }

    try {
      await lobbyClient.leaveMatch(GAME_NAME, matchID, {
        playerID,
        credentials,
      });
    } catch (e) {
      this.props.setErrorMessage('Error when leaving match. Try again.');
      console.error('(leaveMatch)', e);
      return;
    }

    this.authenticator.deleteMatchInfo(matchID);
    console.log(`Deleted credentials for match '${matchID}', seat ${playerID}.`);

    // this will trigger `Matchmaker` to switch to the lobby
    this.props.clearMatchInfo();
  };

  // --- React -----------------------------------------------------------------

  componentDidMount() {
    const { matchInfo, updateIntervalMs } = this.props;

    console.log(`Joined room for match '${matchInfo.matchID}'.`);
    this.props.clearErrorMessage();

    this.fetchMatch();
    this.fetchInterval = setInterval(this.fetchMatch, updateIntervalMs);
  }

  componentWillUnmount() {
    console.log('Leaving room...');
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
          <button className='button' onClick={this.leaveMatch}>
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
    const { expansion, supplyVariant } = this.state;

    return (
      <div>
        <br />
        <div className='mm-container'>
          <div className='mm-div-row'>
            <div className='mm-div-cell'>
              <b>Room ID:</b> {matchInfo.matchID}
            </div>
            <div className='mm-div-cell'>
              <b>{expansionName(expansion)}</b>
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
