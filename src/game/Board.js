import React from 'react';
import Buttons from './Buttons';
import Establishments from './Establishments';
import PlayerInfo from './PlayerInfo';
import Log from './Log';
import { 
  canRollQ, 
  canCommitRollQ, 
  canEndQ, 
  canBuyEstQ, 
  canBuyLandQ, 
  canDoTVQ, 
  canDoOffice1Q, 
  canDoOffice2Q,
} from './Game';

class MachikoroBoard extends React.Component {
  constructor(props) {
    super(props);
    this.names = props.matchData.map( (x) => x.name ? x.name : `player_${x.id}` );
  }

  componentDidUpdate() {
    const { G, ctx, moves } = this.props;

    // auto commitRoll
    if (canCommitRollQ(G, ctx) && !canRollQ(G, ctx, 1) && !canRollQ(G, ctx, 2)) {
      moves.commitRoll();
    }
  }

  // --- Render ----------------------------------------------------------------

  render() {

    const { G, ctx, moves, isActive } = this.props;
    const player = parseInt(ctx.currentPlayer);

    const canRoll = (n) => isActive && canRollQ(G, ctx, n);
    const canKeep = () => isActive && canCommitRollQ(G, ctx);
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
    for (let p=0; p<this.names.length; p++) {
      playerInfoList.push(
        <PlayerInfo 
          key={p}
          p={p}
          money={G.money[p]}
          name={this.names[p]}
          canBuyLand={canBuyLand}
          buyLand={(p, land) => p === player && moves.buyLand(land)}
          land_p={G[`land_${p}`]}
          est_p={G[`est_${p}`]}
          canDoTV={canDoTV}
          doTV={(p) => moves.doTV(p)}
          canDoOffice={canDoOffice}
          doOffice={doOffice}
        />
      );
    }

    return (
      <div>
        <table><tbody>
          <tr valign="top">
            <td>
              <Buttons 
                canRoll={canRoll}
                rollOne={() => moves.rollOne()}
                rollTwo={() => moves.rollTwo()}
                roll={G.roll}
                canKeep={canKeep}
                keep={() => moves.commitRoll()}
                canEnd={canEnd}
                endTurn={() => moves.endTurn()}
                undo={() => this.props.undo()}
              />
              <Establishments 
                est_supply={G.est_supply}
                est_total={G.est_total}
                canBuyEst={canBuyEst}
                buyEst={(est) => moves.buyEst(est)}
              />
            </td>
            {playerInfoList}
            <td>
              <Log 
                gamelog={G.log}
                names={this.names}
              />
            </td>
          </tr>
        </tbody></table>
      </div>
    );

  }
}

export default MachikoroBoard;
