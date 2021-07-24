import './PlayerInfo.css';
import React from 'react';
import classNames from 'classnames';

class PlayerInfo extends React.Component {

  render() {

    const {
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

    const minis = []
    for (let est=0; est<15; est++) {
      for (let i=0; i<est_p[est]; i++) {
        minis.push(
          <div key={`${est}_${i}`} 
            className={classNames("estmini_div", {"active": canDoOffice(p, est)})}
            onClick={() => doOffice(p, est)}
          >
            <img className="estmini_img" src={`./assets/est${est}_mini.png`} alt=""/>
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
        <table><tbody>
          <tr>
            <td className={classNames("land_td", {"active": canBuyLand(p, 0)})} onClick={() => buyLand(p, 0)}>
              <img className={classNames("land_img", {"inactive": !land_p[0]})} src="./assets/land0.gif" alt=""/>
            </td>
            <td className={classNames("land_td", {"active": canBuyLand(p, 1)})} onClick={() => buyLand(p, 1)}>
              <img className={classNames("land_img", {"inactive": !land_p[1]})} src="./assets/land1.gif" alt=""/>
            </td>
          </tr>
          <tr>
            <td className={classNames("land_td", {"active": canBuyLand(p, 2)})} onClick={() => buyLand(p, 2)}>
              <img className={classNames("land_img", {"inactive": !land_p[2]})} src="./assets/land2.gif" alt=""/>
            </td>
            <td className={classNames("land_td", {"active": canBuyLand(p, 3)})} onClick={() => buyLand(p, 3)}>
              <img className={classNames("land_img", {"inactive": !land_p[3]})} src="./assets/land3.gif" alt=""/>
            </td>
          </tr>
        </tbody></table>
        {minis}
      </td>
    );

  }
}

export default PlayerInfo;
