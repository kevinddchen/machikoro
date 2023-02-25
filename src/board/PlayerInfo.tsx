import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { Est, Land, MachikoroG } from 'game';
import { colorToClass, rollsToString } from './utils';
import StackTable from './StackTable';

/**
 * @extends BoardProps<MachikoroG>
 * @prop {number} player - Player number corresponding to the component.
 * @prop {string} name - Player name corresponding to the component.
 * @prop {boolean} isPlayer - True if the client is player number `player`.
 */
interface PlayerInfoProps extends BoardProps<MachikoroG> {
  player: number;
  name: string;
  isPlayer: boolean;
}

/**
 * Information panels for a player, displaying name, money, purchased landmarks
 * and establishments, etc.
 * @prop {Landmark[]} landmarks - List of landmarks in use.
 * @prop {Establishment[]} establishments - List of establishments in use.
 */
export default class PlayerInfo extends React.Component<PlayerInfoProps, object> {
  private landmarks: Land.Landmark[];

  constructor(props: PlayerInfoProps) {
    super(props);
    const { G } = this.props;
    this.landmarks = Land.getAllInUse(G);
  }

  render() {
    const { G, ctx, moves, isActive, player, name } = this.props;
    const currentPlayer = parseInt(ctx.currentPlayer);
    const money = Game.getCoins(G, player);
    const canDoTV = isActive && Game.canDoTV(G, ctx, player);

    // NOTE: `player` is the player that we are rendering info for, and
    // `currentPlayer` is the player whose turn it is in the game.

    // landmarks
    const Table = new StackTable(2);
    for (let i = 0; i < this.landmarks.length; i++) {
      const land = this.landmarks[i];
      const canBuyLand = isActive && player === currentPlayer && Game.canBuyLand(G, ctx, land);
      const owned = Land.owns(G, player, land);

      Table.push(
        <td key={i} className={classNames('land_td', { active: canBuyLand })} onClick={() => moves.buyLand(land)}>
          <img className={classNames('land_img', { inactive: !owned })} src={`./assets/${land.imageFilename}`} alt='' />
          <div className='tooltip'>{land.description}</div>
        </td>
      );
    }

    // establishment miniatures
    const minis = new StackTable(1);

    const ownedEsts = Est.getAllOwned(G, player);
    for (let i = 0; i < ownedEsts.length; i++) {
      const est = ownedEsts[i];
      const count = Est.countOwned(G, player, est);

      let canDoOffice: boolean;
      let doOffice: (est: Est.Establishment) => void;
      if (player === currentPlayer) {
        canDoOffice = isActive && Game.canDoOfficeGive(G, ctx, est);
        doOffice = (est) => moves.doOfficeGive(est);
      } else {
        canDoOffice = isActive && Game.canDoOfficeTake(G, ctx, player, est);
        doOffice = (est) => moves.doOfficeTake(player, est);
      }

      const estColor = colorToClass(est.color, canDoOffice);
      const rollString = rollsToString(est);

      for (let j = 0; j < count; j++) {
        const key = `${i}_${j}`;
        minis.push(
          <td key={key} className={classNames('estmini_td', estColor)} onClick={() => doOffice(est)}>
            <div className='estmini_roll'>{rollString}</div>
            <div className='estmini_type'>{est.type}</div>
            <div className='tooltip'>{est.name}</div>
          </td>
        );
      }
    }

    return (
      <div className='div-column'>
        <div className='coin_num'>${money}</div>
        <div className={classNames('name_div', { active: canDoTV })} onClick={() => moves.doTV(player)}>
          <div className='name_text'>{name}</div>
        </div>
        <div>{Table.render()}</div>
        <div>{minis.render()}</div>
      </div>
    );
  }
}
