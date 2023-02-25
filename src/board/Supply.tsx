import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { Est, MachikoroG } from 'game';
import { estColorToClass, rollsToString } from './utils';
import StackTable from './StackTable';

/**
 * Supply area, where players see and buy establishments
 * @prop {Establishment[]} establishments - List of establishments in use.
 */
export default class Supply extends React.Component<BoardProps<MachikoroG>, object> {
  private establishments: Est.Establishment[];

  constructor(props: BoardProps<MachikoroG>) {
    super(props);
    const { G } = this.props;
    this.establishments = Est.getAllInUse(G);
  }

  render() {
    const { G, ctx, moves, isActive } = this.props;
    const table = new StackTable(5);

    for (let i = 0; i < this.establishments.length; i++) {
      const est = this.establishments[i];

      const canBuyEst = isActive && Game.canBuyEst(G, ctx, est);
      const available = Est.countAvailable(G, est);
      const remaining = Est.countRemaining(G, est);

      // do not display the establishment on the board if
      // (i) it is not available, and
      // (ii) it was not just bought, and
      // (iii) we are not using total supply
      if (
        available === 0 &&
        (G.justBoughtEst === null || !Est.isEqual(est, G.justBoughtEst)) &&
        G.supplyVariant !== Game.SupplyVariant.Total
      ) {
        continue;
      }

      const estColor = estColorToClass(est.color, canBuyEst);
      const rollString = rollsToString(est);

      table.push(
        <td key={i} className={classNames('est_td', estColor)} onClick={() => moves.buyEst(est)}>
          <div className='est_roll'>{rollString}</div>
          <div className='est_type'>{est.type}</div>
          <div className='est_name'>{est.name}</div>
          <div className='est_cost'>${est.cost}</div>
          <div className='est_num'>
            {available}/{remaining}
          </div>
          <div className='est_tooltip'>{est.description}</div>
        </td>
      );
    }

    return <div>{table.render()}</div>;
  }
}
