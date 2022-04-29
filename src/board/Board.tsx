import React from 'react';
import Buttons from './Buttons'; // buttons on top of screen
import Establishments from './Establishments'; // board where establishments are displayed
import PlayerInfo from './PlayerInfo'; // information panels for each player
import Log from './Log'; // game log display
import StatusBar from './StatusBar'; // game status display
import * as game from '../game';
import type { BoardProps } from 'boardgame.io/react';


/**
 * Handles all game components
 */
export default class MachikoroBoard extends React.Component<BoardProps<game.MachikoroG>, {}> {

  private names: string[];

  constructor(props: BoardProps) {
    super(props);
    this.names = props.matchData!.map( (x) => x.name ? x.name : `player_${x.id}` );
  }

  render() {

    const { G, ctx, moves, isActive } = this.props;
    const player = parseInt(ctx.currentPlayer);

    const canRoll = (n: number): boolean => isActive && game.canRoll(G, ctx, n);
    const canKeep = (): boolean => isActive && game.canCommitRoll(G);
    const canAddTwoKeep = (): boolean => isActive && game.canAddTwo(G, ctx);
    const canEndTurn = (): boolean => isActive && game.canEndTurn(G);
    const canBuyEst = (est: number) => isActive && game.canBuyEst(G, ctx, est);
    const canBuyLand = (p: number, land: number) => isActive && p === player && game.canBuyLand(G, ctx, land);
    const canDoTV = (p: number) => isActive && game.canDoTV(G, ctx, p);
    let canDoOffice: (p: number, est: number) => boolean;
    let doOffice: (p: number, est: number) => void;
    if (G.state !== "office2") {
      canDoOffice = (p: number, est: number) => isActive && p === player && game.canDoOfficePhase1(G, ctx, est);
      doOffice = (p: number, est: number) => p === player && moves.doOffice1(est);
    } else {
      canDoOffice = (p: number, est: number) => isActive && game.canDoOfficePhase2(G, ctx, p, est);
      doOffice = (p: number, est: number) => moves.doOffice2(p, est);
    }
  
    const playerInfoList = [];
    for (let i=0; i<this.names.length; i++) {
      const p = parseInt(G.turn_order[i]);
      playerInfoList.push(
        <PlayerInfo 
          key={p}
          playerID={parseInt(this.props.playerID!)}
          p={p}
          money={G.money[p]}
          name={this.names[p]}
          land_use={G.land_use}
          land_p={G.land[p]}
          est_p={G.est[p]}
          canBuyLand={canBuyLand}
          buyLand={(p: number, land: number) => p === player && moves.buyLand(land)}
          canDoTV={canDoTV}
          doTV={(p: number) => moves.doTV(p)}
          canDoOffice={canDoOffice}
          doOffice={doOffice}
        />
      );
    }

    return (
      <div>
        <div className="div-column">
          <div className="div-row">
            <Buttons 
              canRoll={canRoll}
              rollOne={() => moves.rollOne()}
              rollTwo={() => moves.rollTwo()}
              roll={G.roll}
              canKeep={canKeep}
              keep={() => moves.keepRoll()}
              canAddTwoKeep={canAddTwoKeep}
              addTwoKeep={() => moves.addTwo()}
              canEndTurn={canEndTurn}
              endTurn={() => moves.endTurn()}
              undo={() => this.props.undo()}
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
            <Establishments 
              est_use={G.est_use}
              est_supply={G.est_supply}
              est_total={G.est_total}
              canBuyEst={canBuyEst}
              buyEst={(est: number) => moves.buyEst(est)}
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
