import 'styles/main.css';

import { Ctx } from 'boardgame.io';
import React from 'react';
import classNames from 'classnames';

import { MachikoroG, TurnState } from 'game';



/**
 * @param G
 * @param ctx
 * @param names List of player names.
 * @param isActive True if it is the client's turn.
 */
interface StatusBarProps {
  G: MachikoroG;
  ctx: Ctx;
  names: string[];
  isActive: boolean;
}

/**
 * Single-line message bar indicating current turn status.
 */
export default class StatusBar extends React.Component<StatusBarProps, object> {
  render() {
    const { G, ctx, isActive } = this.props;
    const { currentPlayer, gameover } = ctx;
    const { turnState: state } = G;
    const currentPlayerName = this.props.names[parseInt(currentPlayer)];

    let msg = '';

    /* Check `game/machikoro.ts` for various possible states */
    switch (state) {
      case TurnState.Roll: {
        if (isActive) {
          msg = 'It is your turn. Select a roll option from above.';
        } else {
          msg = 'It is ' + currentPlayerName + "'s turn to roll.";
        }
        break;
      }
      case TurnState.Buy: {
        if (isActive) {
          /* to do: write function to check if landmarks can be built? */
          msg = 'Purchase an establishment, build a landmark or end your turn.';
        } else {
          msg = currentPlayerName + ' is making a move...';
        }
        break;
      }
      case TurnState.TV: {
        if (isActive) {
          msg = 'TV station: Choose a player who has to give you 5 coins.';
        } else {
          msg = currentPlayerName + ' is making a move: TV station';
        }
        break;
      }
      case TurnState.OfficeGive:
      case TurnState.OfficeTake: {
        if (isActive) {
          if (state === TurnState.OfficeGive) {
            msg = 'Office: Select an establishment to exchange with another player.';
          } else {
            msg = 'Office: Select an opposing establishment to exchange.';
          }
        } else {
          msg = currentPlayerName + ' is making a move: Office';
        }
        break;
      }
      case TurnState.End: {
        if (isActive) {
          msg = 'No actions left. End turn?';
        } else {
          msg = 'Waiting for ' + currentPlayerName + ' to end the turn...';
        }
        break;
      }
      default:
        msg = state + '...'; /* for debug */
    }

    if (gameover) {
      msg = 'Game over. ' + currentPlayerName + ' wins.';
    }

    return <div className={classNames('status-bar', { 'status-bar-active': isActive })}>{msg}</div>;
  }
}
