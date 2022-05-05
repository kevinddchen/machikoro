import React from 'react';
import { BoardProps } from 'boardgame.io/react';

import Buttons from './Buttons';
import PlayerInfo from './PlayerInfo';
import Log from './Log';
import StatusBar from './StatusBar';
import Supply from './Supply';
import * as game from 'game';

/**
 * Handles all game components
 */
export default class MachikoroBoard extends React.Component<BoardProps<game.MachikoroG>, {}> {

  private names: string[];

  constructor(props: BoardProps) {
    super(props);
    const { matchData } = props;
    this.names = matchData!.map( (x) => x.name ? x.name : `player_${x.id}` );
  }

  render() {

    const { G, ctx, moves, isActive, undo } = this.props;

    // const canRoll = (n: number): boolean => isActive && game.canRoll(G, ctx, n);
    // const canKeep = (): boolean => isActive && game.canCommitRoll(G);
    // const canAddTwoKeep = (): boolean => isActive && game.canAddTwo(G, ctx);
    // const canEndTurn = (): boolean => isActive && game.canEndTurn(G);
    // const canBuyEst = (est: number) => isActive && game.canBuyEst(G, ctx, est);
    // const canBuyLand = (p: number, land: number) => isActive && p === player && game.canBuyLand(G, ctx, land);
    // const canDoTV = (p: number) => isActive && game.canDoTV(G, ctx, p);
    // let canDoOffice: (p: number, est: number) => boolean;
    // let doOffice: (p: number, est: number) => void;
    // if (G.state !== game.State.OfficePhase2) {
    //   canDoOffice = (p: number, est: number) => isActive && p === player && game.canDoOfficePhase1(G, ctx, est);
    //   doOffice = (p: number, est: number) => p === player && moves.doOffice1(est);
    // } else {
    //   canDoOffice = (p: number, est: number) => isActive && game.canDoOfficePhase2(G, ctx, p, est);
    //   doOffice = (p: number, est: number) => moves.doOffice2(p, est);
    // }
  
    const playerInfoList = [];
    for (let i=0; i<this.names.length; i++) {
      const player = parseInt(G.turn_order[i]);
      playerInfoList.push(
        <PlayerInfo 
          G={G}
          ctx={ctx}
          moves={moves}
          isActive={isActive}
          player={player}
          name={this.names[player]}
        />
      );
    }

    return (
      <div>
        <div className="div-column">
          <div className="div-row">
            <Buttons 
              G={G}
              ctx={ctx}
              moves={moves}
              isActive={isActive}
              undo={undo}
            />
          </div>
          <div className="div-row">
            <StatusBar 
              currentPlayer={this.names[parseInt(ctx.currentPlayer)]}
              state={G.state}
              isActive={isActive}
              isGameOver={ctx.gameover}
            />
          </div>
          <div className="div-row">
            <Supply 
              G={G}
              ctx={ctx}
              moves={moves}
              isActive={isActive}
            />
          </div>
        </div>
        <div className="div-column">{playerInfoList}</div>
        <div className="div-column">
          <Log
            log={G.log}
            names={this.names}
          />
        </div>
      </div>
    );

  }
}
