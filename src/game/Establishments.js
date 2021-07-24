import './Establishments.css';
import React from 'react';

class Establishments extends React.Component {

  render() {

    const { est_supply, est_total, canBuyEst, buyEst } = this.props;

    const tbody = [];
    for (let row=0; row<3; row++) {
      const tr = [];
      for (let col=0; col<5; col++) {
        const est = row*5 + col;
        tr.push(
          <td key={col} className={canBuyEst(est) ? "est_td_on" : "est_td"} onClick={() => buyEst(est)}>
            <img className={est_supply[est] > 0 ? "est_img_on" : "est_img"} src={`./assets/est${est}.gif`} alt=""/>
            <div className="est_num">{est_supply[est]}({est_total[est]})</div>
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
