import './PlayerInfo.css';
import React from 'react';
import classNames from 'classnames';
import StackTable from './StackTable';
import { est_order, land_order } from './meta';

class PlayerInfo extends React.Component {

  render() {

    const {
      playerID, 
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
            className={classNames("land_td", {"active": canBuyLand(p, land)})} 
            onClick={() => buyLand(p, land)}
          >
            <img className={classNames(land_img, {"inactive": !land_p[land]})} 
              src={`./assets/${img_path}`}
              alt=""
            />
          </td>
        ); 
    }

    // establishment miniatures
    const minis = []
    for (let i=0; i<est_order.length; i++) {
      const { est, mini_path } = est_order[i];
      console.log(est, mini_path);
      for (let count=0; count<est_p[est]; count++) {
        minis.push(
          <div key={`${i}_${count}`} 
            className={classNames(estmini_div, {"active": canDoOffice(p, est)})}
            onClick={() => doOffice(p, est)}
          >
            <img className="estmini_img" src={`./assets/${mini_path}`} alt=""/>
          </div>
        );
      }
    }

    return (
      <td>
        <div className="coin_td">
          <img className="coin_img" src="./assets/coin.png" alt=""/>
          <div className="coin_num">{money}</div>
        </div>
        <div className={classNames("name_div", {"active": canDoTV(p)})} onClick={() => doTV(p)}>
          <div className="name_text">{name}</div>
        </div>
        {Table.render()}
        <div>{minis}</div>
      </td>
    );

  }
}

export default PlayerInfo;
