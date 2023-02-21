import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { Est, MachikoroG } from 'game';
import StackTable from './StackTable';

/**
 * Convert `Est.EstColor` to CSS class name
 * @param color
 * @param canBuyEst - Color is darker if it can be bought.
 * @returns
 */
const colorToClass = (color: Est.EstColor, canBuyEst: boolean): string => {
  switch (color) {
    case Est.EstColor.Blue:
      return canBuyEst ? 'est_img_pri' : 'est_img_pri_light';
    case Est.EstColor.Green:
      return canBuyEst ? 'est_img_sec' : 'est_img_sec_light';
    case Est.EstColor.Red:
      return canBuyEst ? 'est_img_res' : 'est_img_res_light';
    case Est.EstColor.Purple:
      return canBuyEst ? 'est_img_maj' : 'est_img_maj_light';
    default:
      throw new Error(`Invalid establishment color: ${color}`);
  }
};

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
    const Table = new StackTable(5);

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

      const estColor = colorToClass(est.color, canBuyEst);
      const rollString = est.rolls.map((roll) => roll.toString()).join('; ');

      Table.push(
        <td key={i} className={classNames('est_td', estColor)} onClick={() => moves.buyEst(est)}>
          <div className='est_roll'>{rollString}</div>
          <div className='est_type'>{est.type}</div>
          <div className='est_name'>{est.name}</div>
          <div className='est_num'>
            {available}/{remaining}
          </div>
          <div className='tooltip'>{est.description}</div>
        </td>
      );
    }

    return <div>{Table.render()}</div>;
  }
}
