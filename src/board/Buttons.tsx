import 'styles/main.css';

import React from 'react';
import classNames from 'classnames';

import { 
  Ctx, 
  MachikoroG, 
  Moves,
  canAddTwo,
  canCommitRoll,
  canEndTurn,
  canRoll,
} from 'game';

/**
 * @param G
 * @param ctx
 * @param moves List of moves.
 * @param isActive True if it is the client's turn.
 * @param undo Callback to undo move.
 */
interface ButtonsProps {
  G: MachikoroG;
  ctx: Ctx;
  moves: Moves;
  isActive: boolean;
  undo: () => void;
}

/**
 * Buttons on top of the screen, i.e. Rolling, End Turn, and Undo.
 */
export default class Buttons extends React.Component<ButtonsProps, object> {

  render() {

    const { G, ctx, moves, isActive, undo } = this.props;

    const _canRoll1 = isActive && canRoll(G, ctx, 1);
    const _canRoll2 = isActive && canRoll(G, ctx, 2);
    const _canCommitRoll = isActive && canCommitRoll(G);
    const _canAddTwo = isActive && canAddTwo(G, ctx);
    const _canEndTurn = isActive && canEndTurn(G);

    const tbody = 
      <div className="div-row">
        <div className="div-column">
          <button 
            className={classNames("button", {"button_active": _canRoll1})} 
            onClick={() => moves.rollOne()}
          >
            Roll 1
          </button>

          <button 
            className={classNames("button", {"button_active": _canRoll2})} 
            onClick={() => moves.rollTwo()}
          >
            Roll 2
          </button>

          <button 
            className={classNames("button", {"button_active": _canCommitRoll}, {"button_hide": !_canCommitRoll})}
            onClick={() => moves.keepRoll()}
          >
            Keep ({G.roll})
          </button>

          <button 
            className={classNames("button", {"button_active": _canAddTwo}, {"button_hide": !_canAddTwo})} 
            onClick={() => moves.addTwo()}
          >
            Keep ({G.roll+2})
          </button>
        </div>
        <div className="div-column-right">
          <button 
            className={classNames("button", {"button_active": _canEndTurn})} 
            onClick={() => moves.endTurn()}
          >
            End Turn
          </button>

          <button className="button" onClick={() => undo()}>
            Undo
          </button>
        </div>
      </div>;

    return (
      <div>{tbody}</div>
    );

  }
  
}
