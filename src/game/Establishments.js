import '../styles/main.css';
import React from 'react';
import classNames from 'classnames';
import StackTable from './StackTable';
import { est_order } from './meta';

class Establishments extends React.Component {

  render() {

    const { 
      est_use,
      est_supply, 
      est_total, 
      canBuyEst, 
      buyEst 
    } = this.props;

    const Table = new StackTable(5);
    for (let i=0; i<est_order.length; i++) {
      const { est, img_path } = est_order[i];
      if (est_use[est])
        Table.push(
          <td key={i} 
            className={classNames("est_td", {"active": canBuyEst(est)})} 
            onClick={() => buyEst(est)}
          >
            <img className={classNames("est_img",{"inactive": est_supply[est] === 0})} 
            src={`./assets/${img_path}`} 
            alt=""
            />
            <div className="est_num">
              {est_supply[est]}({est_total[est]})
            </div>
          </td>
        );
    }

    return (
      <div>
        {Table.render()}
      </div>
    );

  }
  
}

export default Establishments;
