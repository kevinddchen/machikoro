import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { Est, Land, MachikoroG } from 'game';

import { estColorToClass, formatRollBoxes, landColorToClass, parseMaterialSymbols } from './utils';
import StackTable from './StackTable';

/**
 * @extends BoardProps<MachikoroG>
 * @prop player - Player ID corresponding to the component.
 * @prop clientPlayer - Player ID of the client, or null if the
 * client is not a player.
 * @prop name - Player name corresponding to the component.
 */
interface PlayerInfoProps extends BoardProps<MachikoroG> {
  player: number;
  clientPlayer: number | null;
  name: string;
}

/**
 * Information panels for a player, displaying name, money, purchased landmarks
 * and establishments, etc.
 */
export default class PlayerInfo extends React.Component<PlayerInfoProps, object> {
  render() {
    const { G, ctx, moves, isActive, player, clientPlayer, name } = this.props;
    const version = G.version;
    const currentPlayer = parseInt(ctx.currentPlayer);
    const money = Game.getCoins(G, player);
    const canDoTV = isActive && Game.canDoTV(G, ctx, player);
    const canDoMovingCompany = isActive && Game.canDoMovingCompanyOpp(G, ctx, player);

    // NOTE: There are 3 different players to keep track of here:
    // `player` is the player ID that this component is rendering info for.
    // `clientPlayer` is the client's player ID
    // `currentPlayer` is the player ID whose turn it is in the game.

    // landmarks
    const landTable = new StackTable(1);

    const lands = Land.getAllInUse(G.version, G.expansions);
    for (let i = 0; i < lands.length; i++) {
      const land = lands[i];
      const owned = Land.owns(G, player, land);

      // for Machi Koro 2, only show owned landmarks
      if (version === Game.Version.MK2 && !owned) {
        continue;
      }

      const canBuyLand = isActive && player === currentPlayer && Game.canBuyLand(G, ctx, land);
      const canDemolitionCompany = isActive && player === currentPlayer && Game.canDoDemolitionCompany(G, ctx, land);

      const landClickable = canBuyLand || canDemolitionCompany;
      const landIsGrey = !(landClickable || owned);
      const landColor = landColorToClass(landClickable);

      let landDescriptionUnparsed = land.description;
      // for Machi Koro 1, add cost to the description if the client does not own the landmark
      if (version === Game.Version.MK1 && (clientPlayer === null || !Land.owns(G, clientPlayer, land))) {
        const landCostArray = Land.costArray(G, land, clientPlayer);
        // Machi Koro 1 only has one cost
        const cost = landCostArray[0];
        landDescriptionUnparsed += `\n\nCost: ${cost.toString()} ${Game.coinPlural(cost)}`;
      }
      const landDescription = parseMaterialSymbols(landDescriptionUnparsed);

      // this prevents the player from buying a landmark by clicking on a landmark not in their `PlayerInfo` component
      let onClickLandEvent: () => void;
      if (player === clientPlayer && canBuyLand) {
        onClickLandEvent = () => { moves.buyLand(land); };
      } else if (player === clientPlayer && canDemolitionCompany) {
        onClickLandEvent = () => { moves.doDemolitionCompany(land); };
      } else {
        onClickLandEvent = () => void 0;
      }

      landTable.push(
        <td
          key={i}
          className={classNames('mini_td', landColor, { inactive: landIsGrey }, { clickable: landClickable })}
          onClick={onClickLandEvent}
        >
          <div className='mini_name'>{land.miniName}</div>
          <div className={classNames('tooltip', 'mini_tooltip')}>{landDescription}</div>
        </td>,
      );
    }

    // establishment miniatures
    const minis = new StackTable(1);

    const ownedEsts = Est.getAllOwned(G, player);
    for (let i = 0; i < ownedEsts.length; i++) {
      const est = ownedEsts[i];
      const count = Est.countOwned(G, player, est);
      const countRenovation = Est.countRenovation(G, player, est);

      // the establishment minis are clickable for a variety of reasons
      const canDoOfficeGive = isActive && player === currentPlayer && Game.canDoOfficeGive(G, ctx, est);
      const canDoOfficeTake = isActive && player !== currentPlayer && Game.canDoOfficeTake(G, ctx, player, est);
      const canDoRenovationCompany = isActive && Game.canDoRenovationCompany(G, est);
      const canDoExhibitHall = isActive && player === currentPlayer && Game.canDoExhibitHall(G, ctx, est);
      const canInvestTechStartup =
        isActive && player === currentPlayer && Est.isEqual(est, Est.TechStartup) && Game.canInvestTechStartup(G, ctx);

      const estClickable =
        canDoOfficeGive || canDoOfficeTake || canDoRenovationCompany || canDoExhibitHall || canInvestTechStartup;
      let onClickEstEvent: (est: Est.Establishment, renovation: boolean) => void;
      if (canDoOfficeGive) {
        onClickEstEvent = (est, renovation) => { moves.doOfficeGive(est, renovation); };
      } else if (canDoOfficeTake) {
        onClickEstEvent = (est, renovation) => { moves.doOfficeTake(player, est, renovation); };
      } else if (canDoRenovationCompany) {
        onClickEstEvent = (est) => { moves.doRenovationCompany(est); };
      } else if (canDoExhibitHall) {
        onClickEstEvent = (est) => { moves.doExhibitHall(est); };
      } else if (canInvestTechStartup) {
        onClickEstEvent = (est) => { moves.investTechStartup(est); };
      } else {
        onClickEstEvent = () => void 0;
      }

      let estDescriptionUnparsed = `${est.name}\n\n${est.description}`;
      // for Tech Startup establishment, add the current investment to the description
      if (Est.isEqual(est, Est.TechStartup)) {
        const investment = Est.getInvestment(G, player);
        estDescriptionUnparsed += `\n\nInvestment: ${investment.toString()} ${Game.coinPlural(investment)}`;
      }

      const estRollBoxes = formatRollBoxes(est.rolls, 'mini_roll_box');
      const estDescription = parseMaterialSymbols(estDescriptionUnparsed);

      for (let j = 0; j < count; j++) {
        const key = `${i.toString()}_${j.toString()}`;
        const renovation = j < countRenovation; // true if establishment should display as "closed under renovations"
        const estColor = estColorToClass(est.color, estClickable, renovation);
        minis.push(
          <td
            key={key}
            className={classNames('mini_td', estColor, { clickable: estClickable })}
            onClick={() => { onClickEstEvent(est, renovation); }}
          >
            <div className='mini_roll'>{estRollBoxes}</div>
            <div className='mini_type'>
              <span className='material-symbols-outlined'>{est.type ? est.type.split('::').join('') : ''}</span>
            </div>
            <div className={classNames('tooltip', 'mini_tooltip')}>{estDescription}</div>
          </td>,
        );
      }
    }

    // player name
    let onClickNameEvent: () => void;
    if (canDoTV) {
      onClickNameEvent = () => { moves.doTV(player); };
    } else if (canDoMovingCompany) {
      onClickNameEvent = () => { moves.doMovingCompanyOpp(player); };
    } else {
      onClickNameEvent = () => void 0;
    }
    const nameDiv = (
      <div className={classNames('name_div', { name_do_tv: canDoTV || canDoMovingCompany })} onClick={onClickNameEvent}>
        {name}
      </div>
    );

    // if client, we add an extra black border around the panel
    const border = clientPlayer === player ? 'is_client' : null;

    return (
      <div className={classNames('div-column', border)}>
        <div>{nameDiv}</div>
        <div className='coin_num'>
          <span className={classNames('material-symbols-outlined', 'dollar_player_money')}>paid</span>
          {money}
        </div>
        <div>{landTable.render()}</div>
        <div>{minis.render()}</div>
      </div>
    );
  }
}
