import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { Est, Land, MachikoroG } from 'game';
import StackTable from './StackTable';

/**
 * @extends BoardProps<MachikoroG>
 * @prop {number} player - Player number corresponding to the component.
 * @prop {string} name - Player name corresponding to the component.
 * @prop {boolean} idClient - True if the client is player number `player`.
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
  private establishments: Est.Establishment[];

  constructor(props: PlayerInfoProps) {
    super(props);
    const { G } = this.props;
    this.establishments = Est.getAllInUse(G);
    this.landmarks = Land.getAllInUse(G);
  }

  render() {
    const { G, ctx, moves, isActive, isClient, player, name } = this.props;
    const currentPlayer = parseInt(ctx.currentPlayer);
    const money = Game.getCoins(G, player);
    const canDoTV = isActive && Game.canDoTV(G, ctx, player);

    const land_img = 'land_img' + (isClient ? '_self' : '');
    const estmini_div = 'estmini_div' + (isClient ? '_self' : '');

    // landmarks
    const Table = new StackTable(2);
    for (let i = 0; i < this.landmarks.length; i++) {
      const land = this.landmarks[i];
      const canBuyLand = isActive && player === currentPlayer && Game.canBuyLand(G, ctx, land);
      const owned = Land.owns(G, player, land);

      Table.push(
        <td key={i} className={classNames('land_td', { active: canBuyLand })} onClick={() => moves.buyLand(land)}>
          <img className={classNames(land_img, { inactive: !owned })} src={`./assets/${land.imageFilename}`} alt='' />
        </td>
      );
    }

    // establishment miniatures
    const minis = [];

    const ownedEstablishments: Est.Establishment[] = [];
    for (const est of this.establishments) if (Est.countOwned(G, player, est) > 0) ownedEstablishments.push(est);

    for (let i = 0; i < ownedEstablishments.length; i++) {
      const est = ownedEstablishments[i];
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

      for (let j = 0; j < count; j++) {
        const which_path =
          i === ownedEstablishments.length - 1 && j === count - 1 ? est.imageFilename : est.miniFilename;

        minis.push(
          <div
            key={`${i}_${j}`}
            className={classNames(estmini_div, { active: canDoOffice })}
            onClick={() => doOffice(est)}
          >
            <img className='estmini_img' src={`./assets/${which_path}`} alt='' />
          </div>
        );
      }
    }

    return (
      <div className='div-column'>
        <div className='coin_td'>
          <img className='coin_img' src='./assets/coin.png' alt='' />
          <div className='coin_num'>{money}</div>
        </div>
        <div className={classNames('name_div', { active: canDoTV })} onClick={() => moves.doTV(player)}>
          <div className='name_text'>{name}</div>
        </div>
        <div>{Table.render()}</div>
        <div>{minis}</div>
      </div>
    );
  }
}
