import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { MachikoroG } from 'game';

/**
 * @extends BoardProps<MachikoroG>
 * @prop {string[]} names - List of player names.
 */
interface StatusBarProps extends BoardProps<MachikoroG> {
  names: string[];
}

/**
 * Single-line message bar indicating current turn status.
 */
export default class StatusBar extends React.Component<StatusBarProps, object> {
  render() {
    const { G, ctx, isActive, names } = this.props;
    const { currentPlayer, gameover } = ctx;
    const currentPlayerName = names[parseInt(currentPlayer)];

    let msg = '';

    /* Check `game/machikoro.ts` for various possible states */
    switch (G.turnState) {
      case Game.TurnState.Roll: {
        if (isActive) {
          msg = 'It is your turn. Select a roll option from above.';
        } else {
          msg = 'It is ' + currentPlayerName + "'s turn to roll.";
        }
        break;
      }
      case Game.TurnState.Buy: {
        if (isActive) {
          /* to do: write function to check if landmarks can be built? */
          msg = 'Purchase an establishment, build a landmark, or end your turn.';
        } else {
          msg = currentPlayerName + ' is making a move...';
        }
        break;
      }
      case Game.TurnState.TV: {
        if (isActive) {
          msg = 'TV station: Choose an opponent who has to give you ' + Game.Est.TVStation.earn + ' coins.';
        } else {
          msg = currentPlayerName + ' is making a move: TV station';
        }
        break;
      }
      case Game.TurnState.OfficeGive:
      case Game.TurnState.OfficeTake: {
        if (isActive) {
          if (G.turnState === Game.TurnState.OfficeGive) {
            msg = 'Business center: Select one of your establishments to exchange.';
          } else {
            msg = "Business center: Select an opponent's establishment to exchange.";
          }
        } else {
          msg = currentPlayerName + ' is making a move: Business center';
        }
        break;
      }
      case Game.TurnState.End: {
        if (isActive) {
          msg = 'No actions left. End turn?';
        } else {
          msg = 'Waiting for ' + currentPlayerName + ' to end the turn...';
        }
        break;
      }
      default: {
        msg = G.turnState + '...'; /* for debug */
      }
    }

    if (gameover) {
      msg = 'Game over. ' + currentPlayerName + ' wins.';
    }

    return <div className={classNames('status-bar', { 'status-bar-active': isActive })}>{msg}</div>;
  }
}
