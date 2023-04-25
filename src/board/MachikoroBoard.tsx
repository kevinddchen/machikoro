import { BoardProps } from 'boardgame.io/react';
import React from 'react';

import { MachikoroG } from 'game';

import Buttons from './Buttons';
import PlayerInfo from './PlayerInfo';
import StatusBar from './StatusBar';
import Supply from './Supply';
import TextPanel from './TextPanel';

/**
 * Initialize the names array given the match data.
 * @param matchData
 * @returns List of player names, in order of player ID.
 */
const initializeNames = (matchData: { id: number; name?: string }[]): string[] => {
  const numPlayers = matchData.length;
  const names = Array.from({ length: numPlayers }, () => '');
  for (const { id, name } of matchData) {
    const displayName = name ? name : `player_${id}`; // use a default name if none is provided
    names[id] = displayName;
  }
  return names;
};

/**
 * Handles all game components
 * @prop {string[]} names - List of player names.
 */
export default class MachikoroBoard extends React.Component<BoardProps<MachikoroG>, object> {
  private names: string[];

  constructor(props: BoardProps<MachikoroG>) {
    super(props);
    const { matchData } = props;
    this.names = initializeNames(matchData!);
  }

  // --- Render ---------------------------------------------------------------

  /**
   * @returns Elements displaying player information (e.g. coins, landmarks, establishments)
   */
  private renderPlayerInfo = (): JSX.Element[] => {
    const { ctx, playerID } = this.props;

    // Player ID of the client.
    const clientPlayer = playerID === null ? null : parseInt(playerID);

    const tbody: JSX.Element[] = [];
    for (let i = 0; i < this.names.length; i++) {
      // Player ID we are rendering info for.
      const player = parseInt(ctx.playOrder[i]);

      tbody.push(
        <PlayerInfo key={i} {...this.props} player={player} clientPlayer={clientPlayer} name={this.names[player]} />
      );
    }
    return tbody;
  };

  render() {
    const { playerID } = this.props;

    // Player ID of the client.
    const clientPlayer = playerID === null ? null : parseInt(playerID);

    return (
      <div className='div-flex'>
        <div className='div-column'>
          <div className='div-row'>
            <Buttons {...this.props} />
          </div>
          <div className='div-row'>
            <StatusBar {...this.props} names={this.names} />
          </div>
          <div className='div-row'>
            <Supply {...this.props} clientPlayer={clientPlayer} />
          </div>
        </div>
        <div className='div-column'>{this.renderPlayerInfo()}</div>
        <div className='div-column'>
          <TextPanel {...this.props} names={this.names} />
        </div>
      </div>
    );
  }
}
