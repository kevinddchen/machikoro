import 'styles/main.css';
import React from 'react';
import classNames from 'classnames';

import {
  MachikoroG,
  Ctx,
  Moves,
  Est,
  Establishment,
  canBuyEst,
} from 'game';
import StackTable from './StackTable';

interface SupplyProps {
  G: MachikoroG;
  ctx: Ctx;
  moves: Moves;
  isActive: boolean;
}

/**
 * Supply area, where players see and buy establishments
 */
export default class Supply extends React.Component<SupplyProps, {}> {

  private establishments: Establishment[];

  constructor(props: SupplyProps) {
    super(props);
    const { G } = this.props;
    this.establishments = Est.getAllInUse(G.est_data);
    // TODO: sort establishments
  }

  render() {

    const { G, ctx, moves, isActive } = this.props;
    const Table = new StackTable(5);

    for (const est of this.establishments) {

      const _canBuyEst = isActive && canBuyEst(G, ctx, est);
      const available = Est.countAvailable(G.est_data, est);
      const remaining = Est.countRemaining(G.est_data, est);

      Table.push(
        <td 
          key={est._id} 
          className={classNames("est_td", {"active": _canBuyEst})} 
          onClick={() => moves.buyEst(est)}
        >
          <img 
            className={classNames("est_img",{"inactive": remaining === 0})} 
            src={`./assets/${est.image_filename}`} 
            alt=""
          />
          <div className="est_num">
            {available}({remaining})
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
