import 'styles/main.css';

import _ from 'lodash';
import React from 'react';
import type { Server } from 'boardgame.io';
import type { LobbyClient } from 'boardgame.io/client';

import Authenticator from './Authenticator';
import { UPDATE_INTERVAL } from 'config';
import { GAME_NAME, Expansion, SupplyVariant } from 'game';
import { ClientInfo } from './types';
import { countPlayers, expansionName, supplyVariantName } from './utils';

/**
 * @extends ClientInfo
 * @param name Name of the player.
 * @param lobbyClient LobbyClient instance used to interact with server match management API
 * @param clearClientInfo Callback to clear client info.
 * @param startMatch Callback to start match.
 * @param setErrorMessage Callback to set error message.
 * @param clearErrorMessage Callback to clear error message.
 */
interface RoomProps extends ClientInfo {
  name: string;
  lobbyClient: LobbyClient;
  clearClientInfo: () => void;
  startMatch: () => void;
  setErrorMessage: (errorMessage: string) => void;
  clearErrorMessage: () => void;
}

/**
 * @param playerList List of metadata for players in the room.
 * @param expansion Expansion to play.
 * @param supplyVariant Supply variant to use.
 */
interface RoomState {
  playerList: Server.PlayerMetadata[];
  expansion?: Expansion;
  supplyVariant?: SupplyVariant;
}

/**
 * Create pre-match waiting room.
 */
export default class Room extends React.Component<RoomProps, RoomState> {

  private fetchInterval?: NodeJS.Timeout;
  private authenticator: Authenticator; // manages local credential storage and retrieval

  constructor (props: RoomProps) {
    super(props);
    this.state = {
      playerList: [], // array of `player` objects
    };
    this.authenticator = new Authenticator();
  }

  /**
   * Fetches list of players from the server. Also automatically starts the 
   * game when there are enough people.
   */
  fetchMatch = async (): Promise<void> => {
    const { matchID, lobbyClient } = this.props;
    const { playerList } = this.state;

    try {
      const match = await lobbyClient.getMatch(GAME_NAME, matchID);
      if (!_.isEqual(match.players, playerList)) {
        const { expansion, supplyVariant } = match.setupData
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
    const { matchID, playerID, credentials, lobbyClient } = this.props;

    try {
      await lobbyClient.leaveMatch(GAME_NAME, matchID, { playerID, credentials });
      this.authenticator.deleteCredentials(matchID);
      console.log(`Deleted credentials for match '${matchID}', seat ${playerID}.`);
      this.props.clearClientInfo();
      // this will trigger `Matchmaker` to switch to the lobby
    } catch (e) {
      this.props.setErrorMessage('Error when leaving match. Try again.');
      console.error('(leaveMatch)', e);
    }
  };

  // --- React -----------------------------------------------------------------

  componentDidMount () {
    const { matchID } = this.props;

    console.log(`Joined room for match '${matchID}'.`);
    this.props.clearErrorMessage();

    this.fetchMatch();
    this.fetchInterval = setInterval(this.fetchMatch, UPDATE_INTERVAL);
  }

  componentWillUnmount () {
    console.log('Leaving room...');
    if (this.fetchInterval)
      clearInterval(this.fetchInterval);
  }

  // --- Render ----------------------------------------------------------------

  renderPlayerList (): JSX.Element[] {
    const { playerID } = this.props;
    const { playerList } = this.state;

    const tbody: JSX.Element[] = [];
    for (let seat = 0; seat < playerList.length; seat++) {
      const { id, name } = playerList[seat];
      let indicator = 'mm-td';
      let button: any;
      if (id.toString() === playerID) {
        indicator = 'mm-td mm-td-active'; /* use css as indicator */
        button = <button className='button' onClick={this.leaveMatch}>Leave</button>
      }
      tbody.push(
        <td className={indicator} key={seat}>
          {seat + 1}: {name} <br/> {button}
        </td>
      );
    }
    return tbody;
  }

  render () {
    const { matchID } = this.props;
    const { expansion, supplyVariant } = this.state;

    return (
      <div><br />
        <div className='mm-container'>
          <div className='mm-div-row'>
            <div className='mm-div-cell'><b>Room ID:</b> {matchID}</div>
            <div className='mm-div-cell'><b>{expansionName(expansion)}</b></div>
            <div className='mm-div-cell'><b>{supplyVariantName(supplyVariant)}</b></div>
          </div>
          <div className='mm-div-row'>Game will start when all seats are filled.</div>
          <div className='mm-div-row'><div className='mm-div-cell'>
            <b>Players</b><br/> 
            <table className='mm-table'><tbody><tr>{this.renderPlayerList()}</tr></tbody></table>
          </div></div>
        </div>
      </div>
    );
  }
}
