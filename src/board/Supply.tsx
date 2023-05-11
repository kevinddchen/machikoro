import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { Est, Land, MachikoroG } from 'game';

import { estColorToClass, landColorToClass, landCostsToString, rollsToString } from './utils';
import StackTable from './StackTable';

/**
 * @extends BoardProps<MachikoroG>
 * @prop {number | null} clientPlayer - Player ID of the client, or null if the
 * client is not a player.
 */
interface SupplyProps extends BoardProps<MachikoroG> {
  clientPlayer: number | null;
}

/**
 * Supply area, where players see and buy establishments
 * @prop {Establishment[]} establishments - List of establishments in use.
 */
export default class Supply extends React.Component<SupplyProps, object> {
  constructor(props: SupplyProps) {
    super(props);
  }

  /**
   * Render the landmark supply. This returns nothing for Machi Koro 1.
   */
  private renderLandTable = (): JSX.Element | null => {
    const { G, ctx, moves, isActive, clientPlayer } = this.props;
    // return nothing for Machi Koro 1.
    if (Game.expToVer(G.expansion) === Game.Version.MK1) {
      return null;
    }

    const table = new StackTable(5);

    const lands = Land.getAllInUse(G);
    for (let i = 0; i < lands.length; i++) {
      const land = lands[i];
      // manually filter out `CityHall2`, which should never appear in the supply
      if (Land.isEqual(land, Land.CityHall2)) {
        continue;
      }

      const isAvailable = Land.isAvailable(G, land);

      // do not display the landmark in the supply if
      // (i) it is not available, and
      // (ii) it was not just bought
      if (!isAvailable && (G.justBoughtLand === null || !Land.isEqual(land, G.justBoughtLand))) {
        continue;
      }

      const canBuyLand = isActive && Game.canBuyLand(G, ctx, land);
      const landColor = landColorToClass(canBuyLand);
      const costsString = landCostsToString(G, land, clientPlayer);

      // use same CSS as establishments
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

      const available = Est.countAvailable(G, est);

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

      const canBuyEst = isActive && Game.canBuyEst(G, ctx, est);
      const remaining = Est.countRemaining(G, est);
      const estColor = estColorToClass(est.color, canBuyEst);
      const rollString = rollsToString(est);

      // place the rolls associated with each establishment in its own box
      const estRollDisplay = []
      const rollStringSplit = rollString.split("; ")
      for (let i = 0; i < rollStringSplit.length; i++) {
        if (i > 0) {
          estRollDisplay.push(' ');
        }
        estRollDisplay.push(<div className='est_roll_box'>{rollStringSplit[i]}</div>);
      }

      table.push(
        <td
          key={i}
          className={classNames('est_td', estColor, { inactive: available === 0 }, { clickable: canBuyEst })}
          onClick={() => moves.buyEst(est)}
        >
          <div className='est_roll'>{estRollDisplay}</div>
          <div className='est_type'><span className="material-symbols-outlined">{est.type}</span></div>
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
