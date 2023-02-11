//
// Utility functions for the log.
//

import { GameMethod } from 'boardgame.io/core';
import { Plugin } from 'boardgame.io';

import { LogEvent, LogLine } from './types';
import { MachikoroG } from '../types';

export * from './types';

export const LogPlugin: Plugin<any, any, MachikoroG> = {
  name: 'log',

  fnWrap: (fn, fnType) =>
    fnType === GameMethod.MOVE
      ? ({ G, log, ...rest }, ...args) => {
          // initialize empty log buffer
          G = { ...G, _logBuffer: [] };
          G = fn({ G, log, ...rest }, ...args);
          log.setMetadata(G._logBuffer);
          // clear log buffer
          G = { ...G, _logBuffer: null };
          return G;
        }
      : fn,
};

/**
 * Log the outcome of rolling one die.
 * @param G
 * @param roll - The value of the die.
 */
export const logRollOne = (G: MachikoroG, roll: number): void => {
  pushLogLine(G, { event: LogEvent.RollOne, roll });
};

/**
 * Log the outcome of rolling two dice
 * @param G
 * @param dice - The values of each die.
 */
export const logRollTwo = (G: MachikoroG, dice: number[]): void => {
  pushLogLine(G, { event: LogEvent.RollTwo, dice });
};

/**
 * Log the use of Harbor to add two to the roll.
 * @param G
 * @param roll - The new value of the roll.
 */
export const logAddTwo = (G: MachikoroG, roll: number): void => {
  pushLogLine(G, { event: LogEvent.AddTwo, roll });
};

/**
 * Log a player earning coins from the bank.
 * @param G
 * @param player
 * @param amount
 * @param name - Name of establishment or landmark activated.
 */
export const logEarn = (G: MachikoroG, player: number, amount: number, name: string): void => {
  pushLogLine(G, { event: LogEvent.Earn, player, amount, name });
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
  pushLogLine(G, { event: LogEvent.Take, ...args, amount, name });
};

/**
 * Log a player purchasing an establishment or landmark.
 * @param G
 * @param name - Name of establishment or landmark activated.
 */
export const logBuy = (G: MachikoroG, name: string): void => {
  return pushLogLine(G, { event: LogEvent.Buy, name });
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
  pushLogLine(G, { event: LogEvent.Office, ...args, opponent });
};

/**
 * Log the tuna roll for the turn.
 * @param G
 * @param roll - The sum value of the two dice.
 */
export const logTunaRoll = (G: MachikoroG, roll: number): void => {
  pushLogLine(G, { event: LogEvent.TunaRoll, roll });
};

/**
 * Log the winner of the game.
 * @param G
 * @param winner - ID of the winning player.
 */
export const logEndGame = (G: MachikoroG, winner: number): void => {
  pushLogLine(G, { event: LogEvent.EndGame, winner });
};

/**
 * Add a `LogLine` to the log buffer.
 * @param G
 * @param line
 */
const pushLogLine = (G: MachikoroG, line: LogLine): void => {
  G._logBuffer!.push(line);
};
