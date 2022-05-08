import 'styles/main.css';

import React from 'react';
import classNames from 'classnames';

import { 
  Ctx, 
  Est, 
  Establishment,
  Land,
  Landmark,
  MachikoroG,
  Moves,
  canBuyLand,
  canDoOfficePhase1,
  canDoOfficePhase2,
  canDoTV,
} from 'game';
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

  private landmarks: Landmark[];
  private establishments: Establishment[];

  constructor(props: PlayerInfoProps) {
    super(props);
    const { G } = this.props;
    this.establishments = Est.getAllInUse(G.est_data)
    this.landmarks = Land.getAllInUse(G.land_data);
  }

  render() {

    const { G, ctx, moves, isActive, isSelf, player, name } = this.props;
    const currentPlayer = parseInt(ctx.currentPlayer);
    const money = G.money[player];
    const _canDoTV = isActive && canDoTV(G, ctx, player);
    
    const land_img = "land_img" + (isSelf ? "_self" : "");
    const estmini_div = "estmini_div" + (isSelf ? "_self" : "");

    // landmarks
    const Table = new StackTable(2);
    for (let i = 0; i < this.landmarks.length; i++){ 
      const land = this.landmarks[i];
      const _canBuyLand = isActive && (player === currentPlayer) && canBuyLand(G, ctx, land);
      const _owned = Land.isOwned(G.land_data, player, land);

      Table.push(
        <td 
          key={i}
          className={classNames("land_td", {"active": _canBuyLand})} 
          onClick={() => moves.buyLand(land)}
        >
          <img 
            className={classNames(land_img, {"inactive": !_owned})} 
            src={`./assets/${land.image_filename}`}
            alt=""
          />
        </td>
      ); 
    }

    // establishment miniatures
    const minis = [];

    const ownedEstablishments: Establishment[] = [];
    for (const est of this.establishments)
      if (Est.countOwned(G.est_data, player, est) > 0)
        ownedEstablishments.push(est);

    for (let i = 0; i < ownedEstablishments.length; i++) {
      const est = ownedEstablishments[i];
      const count = Est.countOwned(G.est_data, player, est);

      let _canDoOffice: boolean;
      let _doOffice: (est: Establishment) => void;
      if (player === currentPlayer) {
        _canDoOffice = isActive && canDoOfficePhase1(G, ctx, est);
        _doOffice = (est) => moves.doOfficePhase1(est);
      } else {
        _canDoOffice = isActive && canDoOfficePhase2(G, ctx, player, est);
        _doOffice = (est) => moves.doOfficePhase2(player, est);
      }
      
      for (let j = 0; j < count; j++) {

        const which_path = (i === ownedEstablishments.length-1 && j === count-1) 
          ? est.image_filename 
          : est.mini_filename;

        minis.push(
          <div 
            key={`${i}_${j}`} 
            className={classNames(estmini_div, {"active": _canDoOffice})}
            onClick={() => _doOffice(est)}
          >
            <img className="estmini_img" src={`./assets/${which_path}`} alt=""/>
          </div>
        );
      }
    }

    return (
      <div className='div-column'>
        <div className="coin_td">
          <img className="coin_img" src="./assets/coin.png" alt=""/>
          <div className="coin_num">{money}</div>
        </div>
        <div className={classNames("name_div", {"active": _canDoTV})} onClick={() => moves.doTV(player)}>
          <div className="name_text">{name}</div>
        </div>
        <div>{Table.render()}</div>
        <div>{minis}</div>
      </div>
    );

  }
}

export default PlayerInfo;
