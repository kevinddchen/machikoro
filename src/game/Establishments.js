import './Establishments.css';
import React from 'react';
import classNames from 'classnames';

export const est_order = [
  {est:  0, name:  "est0.gif", mini:  "est0_mini.png"}, // wheat field
  {est:  1, name:  "est1.gif", mini:  "est1_mini.png"}, // livestock farm
  {est: 16, name: "est16.png", mini: "est16_mini.png"}, // flower orchard
  {est:  5, name:  "est5.gif", mini:  "est5_mini.png"}, // forest 
  {est: 20, name: "est20.png", mini: "est20_mini.png"}, // mackerel boat
  {est: 11, name: "est11.gif", mini: "est11_mini.png"}, // mine
  {est: 13, name: "est13.gif", mini: "est13_mini.png"}, // apple orchard
  {est: 23, name: "est23.png", mini: "est23_mini.png"}, // tuna boat

  {est:  2, name:  "est2.gif", mini:  "est2_mini.png"}, // bakery
  {est:  4, name:  "est4.gif", mini:  "est4_mini.png"}, // convenience store
  {est: 17, name: "est17.png", mini: "est17_mini.png"}, // flower shop
  {est:  9, name:  "est9.gif", mini:  "est9_mini.png"}, // cheese factory
  {est: 10, name: "est10.gif", mini: "est10_mini.png"}, // furniture factory
  {est: 14, name: "est14.gif", mini: "est14_mini.png"}, // produce market
  {est: 24, name: "est24.png", mini: "est24_mini.png"}, // food warehouse

  {est: 15, name: "est15.png", mini: "est15_mini.png"}, // sushi bar
  {est:  3, name:  "est3.gif", mini:  "est3_mini.png"}, // cafe
  {est: 18, name: "est18.png", mini: "est18_mini.png"}, // pizza joint 
  {est: 21, name: "est21.png", mini: "est21_mini.png"}, // hamburger stand
  {est: 12, name: "est12.gif", mini: "est12_mini.png"}, // restaurant

  {est:  6, name:  "est6.gif", mini:  "est6_mini.png"}, // stadium
  {est:  7, name:  "est7.gif", mini:  "est7_mini.png"}, // TV station
  {est:  8, name:  "est8.gif", mini:  "est8_mini.png"}, // office
  {est: 19, name: "est19.png", mini: "est19_mini.png"}, // publisher 
  {est: 22, name: "est22.png", mini: "est22_mini.png"}, // tax office 
];

class Establishments extends React.Component {

  render() {

    const { est_supply, est_total, canBuyEst, buyEst } = this.props;

    const tbody = [];
    for (let row=0; row<5; row++) {
      const tr = [];
      for (let col=0; col<5; col++) {
        const i = row*5 + col;
        if (!(i < 25)) continue;
        const { est, name } = est_order[i];
        tr.push(
          <td key={col} 
            className={classNames(
              "est_td", 
              {"active": canBuyEst(est)}
            )} 
            onClick={() => buyEst(est)}
          >
            <img className={classNames(
              "est_img",
              {"inactive": est_supply[est] === 0}
             )} 
             src={`./assets/${name}`} 
             alt=""
            />
            <div className="est_num">
              {est_supply[est]}({est_total[est]})
            </div>
          </td>
        );
      }
      tbody.push(<tr key={row}>{tr}</tr>);
    }

    return (
      <div>
        <table><tbody>{tbody}</tbody></table>
      </div>
    );

  }
  
}

export default Establishments;
