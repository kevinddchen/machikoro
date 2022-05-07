import '../styles/main.css';
import React from 'react';
import classNames from 'classnames';

import { State } from 'game';

/**
 * Single-line message bar indicating current turn status.
 */
export default class StatusBar extends React.Component<any, {}> {

  render() {

    const { 
      currentPlayer,
      state,
      isActive,
      isGameOver
    } = this.props;

    var msg = '';

    /* Check `game/machikoro.ts` for various possible states */
    switch (state) {
      case State.Roll:
        if (isActive) {
          msg = "It is your turn. Select a roll option from above.";
        } else {
          msg = "It is " + currentPlayer + "'s turn to roll.";
        }
        break;
      case State.Buy:
        if (isActive) {
          /* to do: write function to check if landmarks can be built? */
          msg = "Purchase an establishment, build a landmark or end your turn.";
        } else {
          msg = currentPlayer + " is making a move...";
        }
        break;
      case State.TV:
        if (isActive) {
          msg = "TV station: Choose a player who has to give you 5 coins.";
        } else {
          msg = currentPlayer + " is making a move: TV station";
        }
        break;
      case State.OfficePhase1: 
      case State.OfficePhase2:
        if (isActive) {
          if (state === State.OfficePhase1) {
            msg = "Office: Select an establishment to exchange with another player.";
          } else {
            msg = "Office: Select an opposing establishment to exchange.";
          }
        } else {
          msg = currentPlayer + " is making a move: Office";
        }
        break;
      case State.End:
        if (isActive) {
          msg = "No actions left. End turn?";
        } else {
          msg = "Waiting for " + currentPlayer + " to end the turn...";
        }
        break;
      default:
        msg = state + "...";    /* for debug */
    }

    if (isGameOver) {
      msg = "Game over. " + currentPlayer + " wins."
    }

    return (
      <div className={classNames("status-bar", {"status-bar-active":isActive})}>{msg}</div>
    );

  }
  
}
