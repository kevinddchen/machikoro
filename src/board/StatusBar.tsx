import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import * as Game from 'game';
import { MachikoroG } from 'game';
import { assertUnreachable } from 'common';

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
  /**
   * Returns the status message
   */
  private statusMessage = (): string => {
    const { G, ctx, isActive, names } = this.props;
    const currentPlayerName = names[parseInt(ctx.currentPlayer)];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gameover: boolean = ctx.gameover ?? false;

    if (gameover) {
      return 'Game over! ' + currentPlayerName + ' wins!';
    }

    /* Check `game/machikoro.ts` for various possible states */
    switch (G.turnState) {
      case Game.TurnState.Roll: {
        if (isActive) {
          return 'It is your turn. Select a roll option from above.';
        } else {
          return 'It is ' + currentPlayerName + "'s turn to roll.";
        }
      }
      case Game.TurnState.Buy: {
        if (isActive) {
          /* to do: write function to check if landmarks can be built? */
          return 'Purchase an establishment, build a landmark, or end your turn.';
        } else {
          return currentPlayerName + ' is making a move...';
        }
      }
      case Game.TurnState.TV: {
        if (isActive) {
          return 'TV station: Choose an opponent who has to give you ' + Game.Est.TVStation.earn.toString() + ' coins.';
        } else {
          return currentPlayerName + ' is making a move: TV station';
        }
      }
      case Game.TurnState.OfficeGive:
      case Game.TurnState.OfficeTake: {
        if (isActive) {
          if (G.turnState === Game.TurnState.OfficeGive) {
            return 'Business center: Select one of your establishments to exchange.';
          } else {
            return "Business center: Select an opponent's establishment to exchange.";
          }
        } else {
          return currentPlayerName + ' is making a move: Business center';
        }
      }
      case Game.TurnState.MovingCompany: {
        if (isActive) {
          return 'Moving company: Select one of your establishments to give.';
        } else {
          return currentPlayerName + ' is making a move: Moving company';
        }
      }
      case Game.TurnState.End: {
        if (isActive) {
          return 'No actions left. End turn?';
        } else {
          return 'Waiting for ' + currentPlayerName + ' to end the turn...';
        }
      }
      case Game.TurnState.ActivateEsts:
      case Game.TurnState.ActivateLands:
      case Game.TurnState.ActivateBoughtLand: {
        // these game states are transitionary, so the player should not see any message
        return '';
      }
      default: {
        return assertUnreachable(G.turnState);
      }
    }
  };
  render() {
    const { isActive } = this.props;
    const msg = this.statusMessage();
    return <div className={classNames('status-bar', { 'status-bar-active': isActive })}>{msg}</div>;
  }
}
