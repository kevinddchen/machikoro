import './PlayerInfo.css';
import React from 'react';

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
          <div key={`${est}_${i}`} className={canDoOffice(p, est) ? "estmini_div_on" : "estmini_div"}
               onClick={() => doOffice(p, est)}>
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
        <div className={canDoTV(p) ? "name_div_on" : "name_div"} onClick={() => doTV(p)}>
          <div className="name_text">{name}</div>
        </div>
        <table><tbody>
          <tr>
            <td className={canBuyLand(p, 0) ? "land_td_on" : "land_td"} onClick={() => buyLand(p, 0)}>
              <img className={land_p[0] ? "land_img_on" : "land_img"} src="./assets/land0.gif" alt=""/>
            </td>
            <td className={canBuyLand(p, 1) ? "land_td_on" : "land_td"} onClick={() => buyLand(p, 1)}>
              <img className={land_p[1] ? "land_img_on" : "land_img"} src="./assets/land1.gif" alt=""/>
            </td>
          </tr>
          <tr>
            <td className={canBuyLand(p, 2) ? "land_td_on" : "land_td"} onClick={() => buyLand(p, 2)}>
              <img className={land_p[2] ? "land_img_on" : "land_img"} src="./assets/land2.gif" alt=""/>
            </td>
            <td className={canBuyLand(p, 3) ? "land_td_on" : "land_td"} onClick={() => buyLand(p, 3)}>
              <img className={land_p[3] ? "land_img_on" : "land_img"} src="./assets/land3.gif" alt=""/>
            </td>
          </tr>
        </tbody></table>
        {minis}
      </td>
    );

  }
}

export default PlayerInfo;
