import './PlayerInfo.css';
import React from 'react';
import classNames from 'classnames';
import { est_order, land_order } from './meta';

class PlayerInfo extends React.Component {

  render() {

    const {
      playerID, 
      p, 
      money, 
      name, 
      canBuyLand, 
      buyLand, 
      land_p, 
      est_p, 
      canDoTV,
      doTV,
      canDoOffice,
      doOffice,
    } = this.props;

    const land_img = "land_img" + (p === playerID ? "_self" : "");
    const estmini_div = "estmini_div" + (p === playerID ? "_self" : "");

    const minis = []
    for (let i=0; i<25; i++) {
      const { est, mini } = est_order[i];
      for (let count=0; count<est_p[est]; count++) {
        minis.push(
          <div key={`${est}_${count}`} 
            className={classNames(estmini_div, {"active": canDoOffice(p, est)})}
            onClick={() => doOffice(p, est)}
          >
            <img className="estmini_img" src={`./assets/${mini}`} alt=""/>
          </div>
        );
      }
    }

    const tbody = [];
    for (let row=0; row<3; row++) {
      const tr = [];
      for (let col=0; col<2; col++) {
        const i = row*2 + col;
        const { land, name } = land_order[i];
        tr.push(
          <td key={col} 
            className={classNames("land_td", {"active": canBuyLand(p, land)})} 
            onClick={() => buyLand(p, land)}
          >
            <img className={classNames(land_img, {"inactive": !land_p[land]})} 
              src={`./assets/${name}`}
              alt=""
            />
          </td>
        );
      }
      tbody.push(<tr key={row}>{tr}</tr>);
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
        <table><tbody>{tbody}</tbody></table>
        <div>{minis}</div>
      </td>
    );

  }
}

export default PlayerInfo;
