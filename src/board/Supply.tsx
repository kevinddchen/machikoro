import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { estColorToClass, landColorToClass, rollsToString, landCostsToString } from './utils';
import { Est, Land, MachikoroG } from 'game';
import StackTable from './StackTable';

/**
 * Supply area, where players see and buy establishments
 * @prop {Establishment[]} establishments - List of establishments in use.
 */
export default class Supply extends React.Component<BoardProps<MachikoroG>, object> {
  constructor(props: BoardProps<MachikoroG>) {
    super(props);
  }

  /**
   * Render the landmark supply. This returns nothing for Machi Koro 1.
   */
  private renderLandTable = (): JSX.Element | null => {
    const { G, ctx, moves, isActive } = this.props;
    if (G.expansion !== Game.Expansion.MK2) {
      return null;
    }

    const table = new StackTable(5);

    // manually filter out `CityHall2`, which should never appear in the supply
    const lands = Land.getAllInUse(G).filter((land) => !Land.isEqual(land, Land.CityHall2));
    for (let i = 0; i < lands.length; i++) {
      const land = lands[i];

      const canBuyLand = isActive && Game.canBuyLand(G, ctx, land);
      const isAvailable = Land.isAvailable(G, land);

      // do not display the landmark in the supply if
      // (i) it is not available, and
      // (ii) it was not just bought
      if (!isAvailable && (G.justBoughtLand === null || !Land.isEqual(land, G.justBoughtLand))) {
        continue;
      }

      const landColor = landColorToClass(canBuyLand);
      const costsString = landCostsToString(land);

      table.push(
        <td
          key={i}
          className={classNames('est_td', landColor, { inactive: !isAvailable }, { clickable: canBuyLand })}
          onClick={() => moves.buyLand(land)}
        >
          <div className='est_name'>{land.name}</div>
          <div className='est_cost'>{costsString}</div>
          <div className={classNames('tooltip', 'est_tooltip')}>{land.description}</div>
        </td>
      );
    }

    return table.render();
  };

  private renderEstTable = (): JSX.Element => {
    const { G, ctx, moves, isActive } = this.props;

    const table = new StackTable(5);

    const ests = Est.getAllInUse(G);
    for (let i = 0; i < ests.length; i++) {
      const est = ests[i];

      const canBuyEst = isActive && Game.canBuyEst(G, ctx, est);
      const available = Est.countAvailable(G, est);
      const remaining = Est.countRemaining(G, est);

      // do not display the establishment in the supply if
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
        <td
          key={i}
          className={classNames('est_td', estColor, { inactive: available === 0 }, { clickable: canBuyEst })}
          onClick={() => moves.buyEst(est)}
        >
          <div className='est_roll'>{rollString}</div>
          <div className='est_type'>{est.type}</div>
          <div className='est_name'>{est.name}</div>
          <div className='est_cost'>${est.cost}</div>
          <div className='est_num'>
            {available}/{remaining}
          </div>
          <div className={classNames('tooltip', 'est_tooltip')}>{est.description}</div>
        </td>
      );
    }

    return table.render();
  };

  render() {
    return (
      <div>
        <div>{this.renderLandTable()}</div>
        <div>{this.renderEstTable()}</div>
      </div>
    );
  }
}
