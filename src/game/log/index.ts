//
// Custom plugin to handle logging.
//

import { GameMethod } from 'boardgame.io/core';
import { INVALID_MOVE } from 'boardgame.io/core';
import { Plugin } from 'boardgame.io';

import { BaseLogEvent, LogEventType } from './types';
import { MachikoroG } from '../types';
import { assertUnreachable } from 'common';

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
export const LogxPlugin: Plugin<Record<string, never>, Record<string, never>, MachikoroG> = {
  name: 'logx',

  fnWrap: (fn, fnType) => {
    if (fnType === GameMethod.MOVE) {
      const wrappedFn: typeof fn = ({ G, log, ...rest }, ...args) => {
        // initialize empty log buffer
        G = { ...G, _logBuffer: [] };
        // NOTE: this seems to be the correct type annotation of `moveResult`, but it's not guaranteed.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const moveResult: MachikoroG | typeof INVALID_MOVE = fn({ G, log, ...rest }, ...args);
        if (moveResult === INVALID_MOVE) {
          return INVALID_MOVE;
        }
        log.setMetadata(moveResult._logBuffer);
        // clear log buffer
        G = { ...moveResult, _logBuffer: [] };
        return G;
      };
      return wrappedFn;
    } else {
      return fn;
    }
  },
};

// ----------------------------------------------------------------------------

interface RollOne extends BaseLogEvent {
  type: typeof LogEventType.RollOne;
  roll: number;
}

/**
 * Log the outcome of rolling one die.
 * @param G
 * @param roll - The value of the die.
 */
export const logRollOne = (G: MachikoroG, roll: number): void => {
  const logEvent: RollOne = { type: LogEventType.RollOne, roll };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @returns Displayed log text for rolling one die.
 */
const parseRollOne = (logEvent: RollOne): string => {
  return `\trolled ${logEvent.roll}`;
};

// ----------------------------------------------------------------------------

interface RollTwo extends BaseLogEvent {
  type: typeof LogEventType.RollTwo;
  dice: [number, number];
}

/**
 * Log the outcome of rolling two dice.
 * @param G
 * @param dice - The values of each die.
 */
export const logRollTwo = (G: MachikoroG, dice: [number, number]): void => {
  const logEvent: RollTwo = { type: LogEventType.RollTwo, dice: [dice[0], dice[1]] };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @returns Displayed log text for rolling two dice.
 */
const parseRollTwo = (logEvent: RollTwo): string => {
  const { dice } = logEvent;
  const roll = dice[0] + dice[1];
  return `\trolled ${roll} (${dice[0]}, ${dice[1]})`;
};

// ----------------------------------------------------------------------------

interface AddTwo extends BaseLogEvent {
  type: typeof LogEventType.AddTwo;
  roll: number;
}

/**
 * Log the use of Harbor to add two to the roll.
 * @param G
 * @param roll - The new value of the roll.
 */
export const logAddTwo = (G: MachikoroG, roll: number): void => {
  const logEvent: AddTwo = { type: LogEventType.AddTwo, roll };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @returns Displayed log text for adding two to the roll.
 */
const parseAddTwo = (logEvent: AddTwo): string => {
  return `\tchanged roll to ${logEvent.roll} (Harbor)`;
};

// ----------------------------------------------------------------------------

interface Earn extends BaseLogEvent {
  type: typeof LogEventType.Earn;
  player: number;
  amount: number;
  name: string;
}

/**
 * Log a player earning coins from the bank.
 * @param G
 * @param player
 * @param amount
 * @param name - Name of establishment or landmark activated.
 */
export const logEarn = (G: MachikoroG, player: number, amount: number, name: string): void => {
  const logEvent: Earn = { type: LogEventType.Earn, player, amount, name };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @param names - All player names.
 * @returns Displayed log text for earning coins.
 */
const parseEarn = (logEvent: Earn, names: string[]): string => {
  const { player, amount, name } = logEvent;
  return `\t${names[player]} earned ${amount} coins (${name})`;
};

// ----------------------------------------------------------------------------

interface Take extends BaseLogEvent {
  type: typeof LogEventType.Take;
  from: number;
  to: number;
  amount: number;
  name: string;
}

/**
 * Log a player taking coins from an opponent.
 * @param G
 * @param args.from - Coins are taken from this player
 * @param args.to - Coins are given to this player
 * @param amount
 * @param name - Name of establishment or landmark activated.
 */
export const logTake = (G: MachikoroG, args: { from: number; to: number }, amount: number, name: string): void => {
  const logEvent: Take = { type: LogEventType.Take, ...args, amount, name };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @param names - All player names.
 * @returns Displayed log text for taking coins.
 */
const parseTake = (logEvent: Take, names: string[]): string => {
  const { from, to, amount, name } = logEvent;
  return `\t${names[from]} paid ${names[to]} ${amount} coins (${name})`;
};

// ----------------------------------------------------------------------------

interface Buy extends BaseLogEvent {
  type: typeof LogEventType.Buy;
  name: string;
}

/**
 * Log a player purchasing an establishment or landmark.
 * @param G
 * @param name - Name of establishment or landmark activated.
 */
export const logBuy = (G: MachikoroG, name: string): void => {
  const logEvent: Buy = { type: LogEventType.Buy, name };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @returns Displayed log text for buying an establishment or landmark.
 */
const parseBuy = (logEvent: Buy): string => {
  return `\tbought ${logEvent.name}`;
};

// ----------------------------------------------------------------------------

interface Office extends BaseLogEvent {
  type: typeof LogEventType.Office;
  player_est_name: string;
  opponent_est_name: string;
  opponent: number;
}

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
  const logEvent: Office = { type: LogEventType.Office, ...args, opponent };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @param names - All player names.
 * @returns Displayed log text for the Office establishment.
 */
const parseOffice = (logEvent: Office, names: string[]): string => {
  const { player_est_name, opponent_est_name, opponent } = logEvent;
  return `\texchanged ${player_est_name} for ${opponent_est_name} with ${names[opponent]} (Business Center)`;
};

// ----------------------------------------------------------------------------

interface MovingCompany extends BaseLogEvent {
  type: typeof LogEventType.MovingCompany;
  est_name: string;
  opponent: number;
}

/**
 * Log the effect of the Moving Company landmark.
 * @param G
 * @param est_name
 * @param opponent
 */
export const logMovingCompany = (G: MachikoroG, est_name: string, opponent: number): void => {
  const logEvent: MovingCompany = { type: LogEventType.MovingCompany, est_name, opponent };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @param names - All player names.
 * @returns Displayed log text for the Moving Company landmark.
 */
const parseMovingCompany = (logEvent: MovingCompany, names: string[]): string => {
  const { est_name, opponent } = logEvent;
  return `\tgave ${est_name} to ${names[opponent]} (Moving Company)`;
};

// ----------------------------------------------------------------------------

interface Park extends BaseLogEvent {
  type: typeof LogEventType.Park;
  coins: number;
}

/**
 * Log the effect of the Park landmark.
 * @param G
 * @param coins - Number of coins all players end up with.
 */
export const logPark = (G: MachikoroG, coins: number): void => {
  const logEvent: Park = { type: LogEventType.Park, coins };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @returns Displayed log text for the Park landmark.
 */
const parsePark = (logEvent: Park): string => {
  return `\tredistributed ${logEvent.coins} to each player (Park)`;
};

// ----------------------------------------------------------------------------

interface TunaRoll extends BaseLogEvent {
  type: typeof LogEventType.TunaRoll;
  roll: number;
}

/**
 * Log the tuna roll for the turn.
 * @param G
 * @param roll - The sum value of the two dice.
 */
export const logTunaRoll = (G: MachikoroG, roll: number): void => {
  const logEvent: TunaRoll = { type: LogEventType.TunaRoll, roll };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @returns Displayed log text for the tuna roll.
 */
const parseTunaRoll = (logEvent: TunaRoll): string => {
  return `\t(Tuna boat roll: ${logEvent.roll})`;
};

// ----------------------------------------------------------------------------

interface EndInitialBuyPhase extends BaseLogEvent {
  type: typeof LogEventType.EndInitialBuyPhase;
}

/**
 * Log the end of the initial buy phase.
 * @param G
 */
export const logEndInitialBuyPhase = (G: MachikoroG): void => {
  const logEvent: EndInitialBuyPhase = { type: LogEventType.EndInitialBuyPhase };
  G._logBuffer.push(logEvent);
};

/**
 * @returns Displayed log text for the end of the initial buy phase.
 */
const parseEndInitialBuyPhase = (): string => {
  return `(End of initial build phase)`;
};

// ----------------------------------------------------------------------------

interface EndGame extends BaseLogEvent {
  type: typeof LogEventType.EndGame;
  winner: number;
}

/**
 * Log the winner of the game.
 * @param G
 * @param winner - ID of the winning player.
 */
export const logEndGame = (G: MachikoroG, winner: number): void => {
  const logEvent: EndGame = { type: LogEventType.EndGame, winner };
  G._logBuffer.push(logEvent);
};

/**
 * @param logEvent
 * @param names - All player names.
 * @returns Displayed log text for the end of the game.
 */
const parseEndGame = (logEvent: EndGame, names: string[]): string => {
  return `Game over! Winner: ${names[logEvent.winner]}.`;
};

// ----------------------------------------------------------------------------

export type LogEvent =
  | RollOne
  | RollTwo
  | AddTwo
  | Earn
  | Take
  | Buy
  | Office
  | MovingCompany
  | Park
  | TunaRoll
  | EndInitialBuyPhase
  | EndGame;

export const parseLogEvent = (logEvent: LogEvent, names: string[]): string => {
  if (logEvent.type === LogEventType.RollOne) {
    return parseRollOne(logEvent);
  } else if (logEvent.type === LogEventType.RollTwo) {
    return parseRollTwo(logEvent);
  } else if (logEvent.type === LogEventType.AddTwo) {
    return parseAddTwo(logEvent);
  } else if (logEvent.type === LogEventType.Earn) {
    return parseEarn(logEvent, names);
  } else if (logEvent.type === LogEventType.Take) {
    return parseTake(logEvent, names);
  } else if (logEvent.type === LogEventType.Buy) {
    return parseBuy(logEvent);
  } else if (logEvent.type === LogEventType.Office) {
    return parseOffice(logEvent, names);
  } else if (logEvent.type === LogEventType.MovingCompany) {
    return parseMovingCompany(logEvent, names);
  } else if (logEvent.type === LogEventType.Park) {
    return parsePark(logEvent);
  } else if (logEvent.type === LogEventType.TunaRoll) {
    return parseTunaRoll(logEvent);
  } else if (logEvent.type === LogEventType.EndInitialBuyPhase) {
    return parseEndInitialBuyPhase();
  } else if (logEvent.type === LogEventType.EndGame) {
    return parseEndGame(logEvent, names);
  } else {
    return assertUnreachable(logEvent);
  }
};
