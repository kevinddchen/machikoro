import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { MachikoroG } from 'game';

/**
 * Buttons on top of the screen, i.e. Rolling, End Turn, and Undo.
 */
export default class Buttons extends React.Component<BoardProps<MachikoroG>, object> {
  render() {
    const { G, ctx, moves, isActive, undo } = this.props;

    const canRoll1 = isActive && Game.canRoll(G, ctx, 1);
    const canRoll2 = isActive && Game.canRoll(G, ctx, 2);
    const canCommitRoll = isActive && Game.canCommitRoll(G);
    const canAddTwo = isActive && Game.canAddTwo(G, ctx);
    const canEndTurn = isActive && Game.canEndTurn(G);
    const canSkipOffice = isActive && Game.canSkipOffice(G);

    const tbody = (
      <div className='div-row'>
        <div className='div-column'>
          <button className={classNames('button', { button_active: canRoll1 })} onClick={() => moves.rollOne()}>
            Roll 1
          </button>

          <button className={classNames('button', { button_active: canRoll2 })} onClick={() => moves.rollTwo()}>
            Roll 2
          </button>

          <button
            className={classNames('button', { button_active: canCommitRoll }, { button_hide: !canCommitRoll })}
            onClick={() => moves.keepRoll()}
          >
            Keep ({G.roll})
          </button>

          <button
            className={classNames('button', { button_active: canAddTwo }, { button_hide: !canAddTwo })}
            onClick={() => moves.addTwo()}
          >
            Keep ({G.roll! + 2})
          </button>

          <button
            className={classNames('button', { button_active: canSkipOffice }, { button_hide: !canSkipOffice })}
            onClick={() => moves.skipOffice()}
          >
            Skip
          </button>
        </div>
        <div className='div-column-right'>
          <button className={classNames('button', { button_active: canEndTurn })} onClick={() => moves.endTurn()}>
            End Turn
          </button>

          <button className='button' onClick={() => undo()}>
            Undo
          </button>
        </div>
      </div>
    );

    return <div>{tbody}</div>;
  }
}
