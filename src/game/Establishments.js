import './Establishments.css';
import React from 'react';
import classNames from 'classnames';
import { est_order } from './meta';

class Establishments extends React.Component {

  render() {

    const { est_supply, est_total, canBuyEst, buyEst } = this.props;

    const tbody = [];
    for (let row=0; row<5; row++) {
      const tr = [];
      for (let col=0; col<5; col++) {
        const i = row*5 + col;
        const { est, name } = est_order[i];
        tr.push(
          <td key={col} 
            className={classNames("est_td", {"active": canBuyEst(est)})} 
            onClick={() => buyEst(est)}
          >
            <img className={classNames("est_img",{"inactive": est_supply[est] === 0})} 
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
