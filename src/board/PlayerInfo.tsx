import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { Est, Land, MachikoroG } from 'game';
import { estColorToClass, rollsToString, landColorToClass } from './utils';
import StackTable from './StackTable';

/**
 * @extends BoardProps<MachikoroG>
 * @prop {number} player - Player number corresponding to the component.
 * @prop {string} name - Player name corresponding to the component.
 * @prop {boolean} isClient - True if we are rendering the client's info.
 */
interface PlayerInfoProps extends BoardProps<MachikoroG> {
  player: number;
  name: string;
  isClient: boolean;
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
    const { G, ctx, moves, isActive, isClient, player, name } = this.props;
    const currentPlayer = parseInt(ctx.currentPlayer);
    const money = Game.getCoins(G, player);
    const canDoTV = isActive && Game.canDoTV(G, ctx, player);

    // NOTE: `player` is the player that we are rendering info for, and
    // `currentPlayer` is the player whose turn it is in the game.

    // if client, we add an extra black border around the panel
    const border = isClient ? 'is_client' : '';

    // landmarks
    const lands = new StackTable(1);
    for (let i = 0; i < this.landmarks.length; i++) {
      const land = this.landmarks[i];
      const canBuyLand = isActive && player === currentPlayer && Game.canBuyLand(G, ctx, land);
      const owned = Land.owns(G, player, land);

      const landColor = landColorToClass(owned, canBuyLand);

      lands.push(
        <td
          key={i}
          className={classNames('mini_td', landColor, { clickable: canBuyLand })}
          onClick={() => moves.buyLand(land)}
        >
          <div className='mini_name'>{land.name}</div>
          <div className={classNames('tooltip', 'mini_tooltip')}>{land.description}</div>
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

      const estColor = estColorToClass(est.color, canDoOffice);
      const rollString = rollsToString(est);

      for (let j = 0; j < count; j++) {
        const key = `${i}_${j}`;
        minis.push(
          <td
            key={key}
            className={classNames('mini_td', estColor, { clickable: canDoOffice })}
            onClick={() => doOffice(est)}
          >
            <div className='mini_roll'>{rollString}</div>
            <div className='mini_type'>{est.type}</div>
            <div className={classNames('tooltip', 'mini_tooltip')}>{est.name}</div>
          </td>
        );
      }
    }

    const nameDiv = <div className={classNames('name_text', { name_tv: canDoTV })} onClick={() => moves.doTV(player)}>{name}</div>

    return (
      <div className={classNames('div-column', border)}>
        <div className='coin_num'>${money}</div>
        {/* <div className={classNames('name_div', { name_tv: canDoTV })} onClick={() => moves.doTV(player)}>
          <div className='name_text'>{name}</div>
        </div> */}
        {nameDiv}
        <div>{lands.render()}</div>
        <div>{minis.render()}</div>
      </div>
    );
  }
}
