import 'styles/main.css';

import { LobbyClient } from 'boardgame.io/client';
import React from 'react';
import { Server } from 'boardgame.io';
import _ from 'lodash';

import { Expansion, GAME_NAME, SupplyVariant } from 'game';
import { countPlayers, expansionName, supplyVariantName } from './utils';
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
 * @param playerList - List of metadata for players in the room.
 * @param expansion - Expansion to play. This is initially not set, but is fetched.
 * @param supplyVariant - Supply variant to use. This is initially not set, but is fetched.
 */
interface RoomState {
  playerList: Server.PlayerMetadata[];
  expansion?: Expansion;
  supplyVariant?: SupplyVariant;
}

/**
 * @prop {Timeout} fetchInterval - Interval timer for fetching matches.
 * @prop {Authenticator} authenticator - Manages local credential storage and retrieval.
 */
export default class Room extends React.Component<RoomProps, RoomState> {
  private fetchInterval?: NodeJS.Timeout;
  private authenticator: Authenticator; // manages local credential storage and retrieval

  constructor(props: RoomProps) {
    super(props);
    this.state = {
      playerList: [],
    };
    this.authenticator = new Authenticator();
  }

  /**
   * Fetches list of players from the server. Also automatically starts the
   * game when there are enough people.
   */
  fetchMatch = async (): Promise<void> => {
    const { matchInfo, lobbyClient } = this.props;
    const { matchID } = matchInfo;
    const { playerList } = this.state;

    try {
      const match = await lobbyClient.getMatch(GAME_NAME, matchID);
      if (!_.isEqual(match.players, playerList)) {
        const { expansion, supplyVariant } = match.setupData;
        this.setState({ playerList: match.players, expansion, supplyVariant });
        // if seats are all full, start match now
        if (countPlayers(match.players) === match.players.length) {
          this.props.startMatch();
        }
      }
    } catch (e) {
      // TODO: do we need to display "Cannot fetch Matches" like in the Lobby?
      console.error('(fetchMatch)', e);
    }
  };

  /**
   * Leave the match and delete credentials.
   */
  leaveMatch = async (): Promise<void> => {
    const {
      matchInfo: { matchID, playerID, credentials },
      lobbyClient,
    } = this.props;

    try {
      await lobbyClient.leaveMatch(GAME_NAME, matchID, {
        playerID,
        credentials,
      });
      this.authenticator.deleteMatchInfo(matchID);
      console.log(`Deleted credentials for match '${matchID}', seat ${playerID}.`);
      this.props.clearMatchInfo();
      // this will trigger `Matchmaker` to switch to the lobby
    } catch (e) {
      this.props.setErrorMessage('Error when leaving match. Try again.');
      console.error('(leaveMatch)', e);
    }
  };

  // --- React -----------------------------------------------------------------

  componentDidMount() {
    const {
      matchInfo: { matchID },
    } = this.props;

    console.log(`Joined room for match '${matchID}'.`);
    this.props.clearErrorMessage();

    this.fetchMatch();
    this.fetchInterval = setInterval(this.fetchMatch, UPDATE_INTERVAL_MS);
  }

  componentWillUnmount() {
    console.log('Leaving room...');
    if (this.fetchInterval) clearInterval(this.fetchInterval);
  }

  // --- Render ----------------------------------------------------------------

  renderPlayerList(): JSX.Element[] {
    const {
      matchInfo: { playerID },
    } = this.props;
    const { playerList } = this.state;

    const tbody: JSX.Element[] = [];
    for (let seat = 0; seat < playerList.length; seat++) {
      const { id, name } = playerList[seat];
      let indicator = 'mm-td';
      let button: JSX.Element | null;
      if (id.toString() === playerID) {
        indicator = 'mm-td mm-td-active'; /* use css as indicator */
        button = (
          <button className='button' onClick={this.leaveMatch}>
            Leave
          </button>
        );
      } else {
        button = null;
      }
      tbody.push(
        <td className={indicator} key={seat}>
          {seat + 1}: {name} <br /> {button}
        </td>
      );
    }
    return tbody;
  }

  render() {
    const {
      matchInfo: { matchID },
    } = this.props;
    const { expansion, supplyVariant } = this.state;

    return (
      <div>
        <br />
        <div className='mm-container'>
          <div className='mm-div-row'>
            <div className='mm-div-cell'>
              <b>Room ID:</b> {matchID}
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
                  <tr>{this.renderPlayerList()}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
