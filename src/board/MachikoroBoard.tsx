import { BoardProps } from 'boardgame.io/react';
import React from 'react';

import * as game from 'game';
import Buttons from './Buttons';
import Logger from './Logger';
import PlayerInfo from './PlayerInfo';
import StatusBar from './StatusBar';
import Supply from './Supply';

/**
 * Handles all game components
 */
export default class MachikoroBoard extends React.Component<BoardProps<game.MachikoroG>, object> {
  private names: string[];

  constructor(props: BoardProps) {
    super(props);
    const { matchData } = props;
    this.names = matchData!.map((x) => (x.name ? x.name : `player_${x.id}`));
  }

  render() {
    const { G, ctx, moves, log, isActive, playerID, undo } = this.props;
    const playerInfoList: JSX.Element[] = [];

    for (let i = 0; i < this.names.length; i++) {
      const player = parseInt(G.turn_order[i]);
      const isSelf = !!playerID && player === parseInt(playerID); // true if `player` is the client's player number
      playerInfoList.push(
        <PlayerInfo
          key={i}
          G={G}
          ctx={ctx}
          moves={moves}
          isActive={isActive}
          isSelf={isSelf}
          player={player}
          name={this.names[player]}
        />
      );
    }

    return (
      <div>
        <div className='div-column'>
          <div className='div-row'>
            <Buttons G={G} ctx={ctx} moves={moves} isActive={isActive} undo={undo} />
          </div>
          <div className='div-row'>
            <StatusBar G={G} ctx={ctx} names={this.names} isActive={isActive} />
          </div>
          <div className='div-row'>
            <Supply G={G} ctx={ctx} moves={moves} isActive={isActive} />
          </div>
        </div>
        <div className='div-column'>{playerInfoList}</div>
        <div className='div-column'>
          <Logger G={G} log={log} names={this.names} />
        </div>
      </div>
    );
  }
}
