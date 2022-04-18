import React from 'react';
import Buttons from './Buttons'; // buttons on top of screen
import Establishments from './Establishments'; // board where establishments are displayed
import PlayerInfo from './PlayerInfo'; // information panels for each player
import Log from './Log'; // game log display
import StatusBar from './StatusBar'; // game status display
import { 
  canRollQ, 
  canCommitRollQ, 
  canAddTwoQ,
  canBuyEstQ, 
  canBuyLandQ, 
  canDoTVQ, 
  canDoOffice1Q, 
  canDoOffice2Q,
  canEndQ, 
} from './Game'; // actual logic of the game

/**
 * Handles all game components
 */

class MachikoroBoard extends React.Component {
  constructor(props) {
    super(props);
    this.names = props.matchData.map( (x) => x.name ? x.name : `player_${x.id}` );
  }

  render() {

    const { G, ctx, moves, isActive } = this.props;
    const player = parseInt(ctx.currentPlayer);

    const canRoll = (n) => isActive && canRollQ(G, ctx, n);
    const canKeep = () => isActive && canCommitRollQ(G, ctx);
    const canAddTwoKeep = () => isActive && canAddTwoQ(G, ctx);
    const canEnd = () => isActive && canEndQ(G, ctx);
    const canBuyEst = (est) => isActive && canBuyEstQ(G, ctx, est);
    const canBuyLand = (p, land) => isActive && p === player && canBuyLandQ(G, ctx, land);
    const canDoTV = (p) => isActive && canDoTVQ(G, ctx, p);
    let canDoOffice,
        doOffice;
    if (G.state !== "office2") {
      canDoOffice = (p, est) => isActive && p === player && canDoOffice1Q(G, ctx, est);
      doOffice = (p, est) => p === player && moves.doOffice1(est);
    } else {
      canDoOffice = (p, est) => isActive && canDoOffice2Q(G, ctx, p, est);
      doOffice = (p, est) => moves.doOffice2(p, est);
    }
  
    const playerInfoList = [];
    for (let i=0; i<this.names.length; i++) {
      const p = parseInt(G.turn_order[i]);
      playerInfoList.push(
        <PlayerInfo 
          key={p}
          playerID={parseInt(this.props.playerID)}
          p={p}
          money={G.money[p]}
          name={this.names[p]}
          land_use={G.land_use}
          land_p={G[`land_${p}`]}
          est_p={G[`est_${p}`]}
          canBuyLand={canBuyLand}
          buyLand={(p, land) => p === player && moves.buyLand(land)}
          canDoTV={canDoTV}
          doTV={(p) => moves.doTV(p)}
          canDoOffice={canDoOffice}
          doOffice={doOffice}
        />
      );
    }

    return (
      <div>
        <div class="div-column">
          <div class="div-row">
            <Buttons 
              canRoll={canRoll}
              rollOne={() => moves.rollOne()}
              rollTwo={() => moves.rollTwo()}
              roll={G.roll}
              canKeep={canKeep}
              keep={() => moves.keepRoll()}
              canAddTwoKeep={canAddTwoKeep}
              addTwoKeep={() => moves.addTwo()}
              canEnd={canEnd}
              endTurn={() => moves.endTurn()}
              undo={() => this.props.undo()}
            />
          </div>
          <div class="div-row">
            <StatusBar 
              currentPlayer={this.names[ctx.currentPlayer]}
              state={G.state}
              isActive={isActive}
              isGameOver={ctx.gameover}
            />
          </div>
          <div class="div-row">
            <Establishments 
              est_use={G.est_use}
              est_supply={G.est_supply}
              est_total={G.est_total}
              canBuyEst={canBuyEst}
              buyEst={(est) => moves.buyEst(est)}
            />
          </div>
        </div>
        <div class="div-column">{playerInfoList}</div>
        <div class="div-column">
          <Log
            log={G.log}
            names={this.names}
          />
        </div>
      </div>
    );

  }
}

export default MachikoroBoard;
