//
// Custom plugin to handle logging.
//

import { GameMethod } from 'boardgame.io/core';
import { INVALID_MOVE } from 'boardgame.io/core';
import { Plugin } from 'boardgame.io';

import { LogEventType } from './types';
import { MachikoroG } from '../types';

export * from './types';

/**
 * 'logx' stands for 'log-extension', where we add additional functionality to
 * the built-in 'log' plugin.
 *
 * Over the course of a move, we accumulate `LogEvent` objects which each
 * represent an event that should be logged. These are gathered in a buffer
 * array stored in `G._logBuffer`. At the end of the move, the array of
 * `LogEvent` objects is flushed to the `log.setMetadata` method, which stores
 * these log events as metadata for the move.
 *
 * On the client, this array of `LogEvent` objects are retrieved from where it
 * can be parsed.
 */
export const LogxPlugin: Plugin<any, any, MachikoroG> = {
  name: 'logx',

  fnWrap: (fn, fnType) => {
    if (fnType === GameMethod.MOVE) {
      return ({ G, log, ...rest }, ...args) => {
        // initialize empty log buffer
        G = { ...G, _logBuffer: [] };
        const moveResult = fn({ G, log, ...rest }, ...args);
        if (moveResult === INVALID_MOVE) {
          return INVALID_MOVE;
        }
        log.setMetadata(moveResult._logBuffer);
        // clear log buffer
        G = { ...moveResult, _logBuffer: null };
        return G;
      };
    } else {
      return fn;
    }
  },
};

/**
 * Log the outcome of rolling one die.
 * @param G
 * @param roll - The value of the die.
 */
export const logRollOne = (G: MachikoroG, roll: number): void => {
  G._logBuffer!.push({ eventType: LogEventType.RollOne, roll });
};

/**
 * Log the outcome of rolling two dice
 * @param G
 * @param dice - The values of each die.
 */
export const logRollTwo = (G: MachikoroG, dice: number[]): void => {
  G._logBuffer!.push({ eventType: LogEventType.RollTwo, dice });
};

/**
 * Log the use of Harbor to add two to the roll.
 * @param G
 * @param roll - The new value of the roll.
 */
export const logAddTwo = (G: MachikoroG, roll: number): void => {
  G._logBuffer!.push({ eventType: LogEventType.AddTwo, roll });
};

/**
 * Log a player earning coins from the bank.
 * @param G
 * @param player
 * @param amount
 * @param name - Name of establishment or landmark activated.
 */
export const logEarn = (G: MachikoroG, player: number, amount: number, name: string): void => {
  G._logBuffer!.push({ eventType: LogEventType.Earn, player, amount, name });
};

/**
 * Log a player taking coins from an opponent.
 * @param G
 * @param args.from - Coins are taken from this player
 * @param args.to - Coins are given to this player
 * @param amount
 * @param name - Name of establishment or landmark activated.
 */
export const logTake = (G: MachikoroG, args: { from: number; to: number }, amount: number, name: string): void => {
  G._logBuffer!.push({ eventType: LogEventType.Take, ...args, amount, name });
};

/**
 * Log a player purchasing an establishment or landmark.
 * @param G
 * @param name - Name of establishment or landmark activated.
 */
export const logBuy = (G: MachikoroG, name: string): void => {
  G._logBuffer!.push({ eventType: LogEventType.Buy, name });
};

/**
 * Log the effect of the Office establishment.
 * @param G
 * @param args.player_est_name - Name of the player's establishment.
 * @param args.opponent_est_name - Name of the opponent's establishment.
 * @param opponent
 */
export const logOffice = (
  G: MachikoroG,
  args: { player_est_name: string; opponent_est_name: string },
  opponent: number
): void => {
  G._logBuffer!.push({ eventType: LogEventType.Office, ...args, opponent });
};

/**
 * Log the effect of the Moving Company landmark.
 * @param G
 * @param est_name
 * @param opponent
 */
export const logMovingCompany = (G: MachikoroG, est_name: string, opponent: number): void => {
  G._logBuffer!.push({ eventType: LogEventType.MovingCompany, est_name, opponent });
};

/**
 * Log the effect of the Park landmark.
 * @param G
 * @param coins - Number of coins all players end up with.
 */
export const logPark = (G: MachikoroG, coins: number): void => {
  G._logBuffer!.push({ eventType: LogEventType.Park, coins });
};

/**
 * Log the tuna roll for the turn.
 * @param G
 * @param roll - The sum value of the two dice.
 */
export const logTunaRoll = (G: MachikoroG, roll: number): void => {
  G._logBuffer!.push({ eventType: LogEventType.TunaRoll, roll });
};

/**
 * Log the end of the initial buy phase.
 * @param G
 */
export const logEndInitialBuyPhase = (G: MachikoroG): void => {
  G._logBuffer!.push({ eventType: LogEventType.EndInitialBuyPhase });
};

/**
 * Log the winner of the game.
 * @param G
 * @param winner - ID of the winning player.
 */
export const logEndGame = (G: MachikoroG, winner: number): void => {
  G._logBuffer!.push({ eventType: LogEventType.EndGame, winner });
};
