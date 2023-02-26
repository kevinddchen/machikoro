import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { Est, Land, MachikoroG } from 'game';
import { estColorToClass, landColorToClass, rollsToString } from './utils';
import StackTable from './StackTable';

/**
 * @extends BoardProps<MachikoroG>
 * @prop {number} player - Player ID corresponding to the component.
 * @prop {number | null} clientPlayer - Player ID of the client, or null if the
 * client is not a player.
 * @prop {string} name - Player name corresponding to the component.
 */
interface PlayerInfoProps extends BoardProps<MachikoroG> {
  player: number;
  clientPlayer: number | null;
  name: string;
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
    const { G, ctx, moves, isActive, player, clientPlayer, name } = this.props;
    const currentPlayer = parseInt(ctx.currentPlayer);
    const money = Game.getCoins(G, player);
    const canDoTV = isActive && Game.canDoTV(G, ctx, player);

    // NOTE: `player` is the player that we are rendering info for, and
    // `currentPlayer` is the player whose turn it is in the game.

    // landmarks
    const lands = new StackTable(1);
    for (let i = 0; i < this.landmarks.length; i++) {
      const land = this.landmarks[i];
      const canBuyLand = isActive && player === currentPlayer && Game.canBuyLand(G, ctx, land);
      const owned = Land.owns(G, player, land);

      const landColor = landColorToClass(owned, canBuyLand);

      let landDescription = land.description;
      // add cost to the description if the client does not own the landmark
      if (clientPlayer === null || !Land.owns(G, clientPlayer, land)) {
        // TODO: this is fucked in Machi Koro 2
        landDescription += '\n\nCost: ' + land.cost[0].toString();
      }

      lands.push(
        <td
          key={i}
          className={classNames('mini_td', landColor, { clickable: canBuyLand })}
          onClick={() => moves.buyLand(land)}
        >
          <div className='mini_name'>{land.name}</div>
          <div className={classNames('tooltip', 'mini_tooltip')}>{landDescription}</div>
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

    const nameDiv = (
      <div className={classNames('name_text', { name_do_tv: canDoTV })} onClick={() => moves.doTV(player)}>
        {name}
      </div>
    );

    // if client, we add an extra black border around the panel
    const border = clientPlayer === player ? 'is_client' : null;

    return (
      <div className={classNames('div-column', border)}>
        <div className='coin_num'>${money}</div>
        <div>{nameDiv}</div>
        <div>{lands.render()}</div>
        <div>{minis.render()}</div>
      </div>
    );
  }
}
