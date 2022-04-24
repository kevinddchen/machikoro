import '../styles/main.css';
import React from 'react';
import classNames from 'classnames';
import StackTable from './StackTable';
import { est_order, land_order } from '../game/meta';

/**
 * Information panels for a player, displaying name, money, purchased landmarks 
 * and establishments, etc.
 */

class PlayerInfo extends React.Component {

  render() {

    const {
      playerID, // ID of player rendering the board
      p, 
      money, 
      name, 
      land_use,
      land_p, 
      est_p, 
      canBuyLand, 
      buyLand, 
      canDoTV,
      doTV,
      canDoOffice,
      doOffice,
    } = this.props;

    const land_img = "land_img" + (p === playerID ? "_self" : "");
    const estmini_div = "estmini_div" + (p === playerID ? "_self" : "");

    // landmarks
    const Table = new StackTable(2);
    for (let i=0; i<land_order.length; i++) {
      const { land, img_path } = land_order[i];
      if (land_use[land])
        Table.push(
          <td key={i} 
            class={classNames("land_td", {"active": canBuyLand(p, land)})} 
            onClick={() => buyLand(p, land)}
          >
            <img class={classNames(land_img, {"inactive": !land_p[land]})} 
              src={`./assets/${img_path}`}
              alt=""
            />
          </td>
        ); 
    }

    // establishment miniatures
    const minis = [];

    // determine est index of the last displayed establishment 
    for (let i=0; i<est_order.length; i++) {
      const { est } = est_order[est_order.length-i-1];
      if (est_p[est] > 0) {
        var last_est_id = est;
        break;
      }
    }

    for (let i=0; i<est_order.length; i++) {
      const { est, img_path, mini_path } = est_order[i];
      for (let count=0; count<est_p[est]; count++) {
        var which_path
        if (est === last_est_id && count === est_p[est]-1) {
          // show the last card in full
          which_path = img_path;
        } else {
          which_path = mini_path;
        }
        minis.push(
          <div key={`${i}_${count}`} 
            class={classNames(estmini_div, {"active": canDoOffice(p, est)})}
            onClick={() => doOffice(p, est)}
          >
            <img class="estmini_img" src={`./assets/${which_path}`} alt=""/>
          </div>
        );
      }
    }

    return (
      <td>
        <div class="coin_td">
          <img class="coin_img" src="./assets/coin.png" alt=""/>
          <div class="coin_num">{money}</div>
        </div>
        <div class={classNames("name_div", {"active": canDoTV(p)})} onClick={() => doTV(p)}>
          <div class="name_text">{name}</div>
        </div>
        <div>{Table.render()}</div>
        <div>{minis}</div>
      </td>
    );

  }
}

export default PlayerInfo;
