import 'styles/main.css';

import { Ctx } from 'boardgame.io';
import React from 'react';
import classNames from 'classnames';

import * as Est from 'game/establishments';
import { MachikoroG, Moves, SupplyVariant, canBuyEst } from 'game';
import StackTable from './StackTable';

/**
 * @param G
 * @param ctx
 * @param moves List of moves.
 * @param isActive True if it is the client's turn.
 */
interface SupplyProps {
  G: MachikoroG;
  ctx: Ctx;
  moves: Moves;
  isActive: boolean;
}

/**
 * Supply area, where players see and buy establishments
 */
export default class Supply extends React.Component<SupplyProps, object> {
  private establishments: Est.Establishment[];

  constructor(props: SupplyProps) {
    super(props);
    const { G } = this.props;
    this.establishments = Est.getAllInUse(G);
  }

  render() {
    const { G, ctx, moves, isActive } = this.props;
    const Table = new StackTable(5);

    for (let i = 0; i < this.establishments.length; i++) {
      const est = this.establishments[i];

      const _canBuyEst = isActive && canBuyEst(G, ctx, est);
      const available = Est.countAvailable(G, est);
      const remaining = Est.countRemaining(G, est);

      // display the establishment on the board if
      // (i) it is available, or
      // (ii) it was just bought, or
      // (iii) we are using total supply
      if (
        available > 0 ||
        (!!G.justBoughtEst && Est.isEqual(est, G.justBoughtEst)) ||
        G.supplyVariant === SupplyVariant.Total
      ) {
        Table.push(
          <td key={i} className={classNames('est_td', { active: _canBuyEst })} onClick={() => moves.buyEst(est)}>
            <img
              className={classNames('est_img', { inactive: available === 0 })}
              src={`./assets/${est.imageFilename}`}
              alt=''
            />
            <div className='est_num'>
              {available}/{remaining}
            </div>
          </td>
        );
      }
    }

    return <div>{Table.render()}</div>;
  }
}
