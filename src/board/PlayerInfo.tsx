import 'styles/main.css';

import { Ctx } from 'boardgame.io';
import React from 'react';
import classNames from 'classnames';

import * as Est from 'game/establishments';
import * as Land from 'game/landmarks';
import { MachikoroG, canBuyLand, canDoOfficeGive, canDoOfficeTake, canDoTV, getCoins } from 'game';
import { Moves } from './types';
import StackTable from './StackTable';

/**
 * @param G
 * @param ctx
 * @param moves List of moves.
 * @param isActive True if it is the client's turn.
 * @param isSelf True if `player` is the client's player number.
 * @param player Player number (not necessarily the client's player number).
 * @param name Player name (not necessarily the client's name).
 */
interface PlayerInfoProps {
  G: MachikoroG;
  ctx: Ctx;
  moves: Moves;
  isActive: boolean;
  isSelf: boolean;
  player: number;
  name: string;
}

/**
 * Information panels for a player, displaying name, money, purchased landmarks
 * and establishments, etc.
 */
class PlayerInfo extends React.Component<PlayerInfoProps, object> {
  private landmarks: Land.Landmark[];
  private establishments: Est.Establishment[];

  constructor(props: PlayerInfoProps) {
    super(props);
    const { G } = this.props;
    this.establishments = Est.getAllInUse(G);
    this.landmarks = Land.getAllInUse(G);
  }

  render() {
    const { G, ctx, moves, isActive, isSelf, player, name } = this.props;
    const currentPlayer = parseInt(ctx.currentPlayer);
    const money = getCoins(G, player);
    const _canDoTV = isActive && canDoTV(G, ctx, player);

    const land_img = 'land_img' + (isSelf ? '_self' : '');
    const estmini_div = 'estmini_div' + (isSelf ? '_self' : '');

    // landmarks
    const Table = new StackTable(2);
    for (let i = 0; i < this.landmarks.length; i++) {
      const land = this.landmarks[i];
      const _canBuyLand = isActive && player === currentPlayer && canBuyLand(G, ctx, land);
      const _owned = Land.owns(G, player, land);

      Table.push(
        <td key={i} className={classNames('land_td', { active: _canBuyLand })} onClick={() => moves.buyLand(land)}>
          <img className={classNames(land_img, { inactive: !_owned })} src={`./assets/${land.imageFilename}`} alt='' />
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

      let _canDoOffice: boolean;
      let _doOffice: (est: Est.Establishment) => void;
      if (player === currentPlayer) {
        _canDoOffice = isActive && canDoOfficeGive(G, ctx, est);
        _doOffice = (est) => moves.doOfficeGive(est);
      } else {
        _canDoOffice = isActive && canDoOfficeTake(G, ctx, player, est);
        _doOffice = (est) => moves.doOfficeTake(player, est);
      }

      for (let j = 0; j < count; j++) {
        const which_path =
          i === ownedEstablishments.length - 1 && j === count - 1 ? est.imageFilename : est.miniFilename;

        minis.push(
          <div
            key={`${i}_${j}`}
            className={classNames(estmini_div, { active: _canDoOffice })}
            onClick={() => _doOffice(est)}
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
        <div className={classNames('name_div', { active: _canDoTV })} onClick={() => moves.doTV(player)}>
          <div className='name_text'>{name}</div>
        </div>
        <div>{Table.render()}</div>
        <div>{minis}</div>
      </div>
    );
  }
}

export default PlayerInfo;
