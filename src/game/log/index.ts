//
// Utility functions for the log.
//

import { LogEvent } from './types';

import type { LogLine } from './types';

export * as Types from './types';

export const rollOne = (roll: number): LogLine => {
  return {
    event: LogEvent.RollOne,
    roll,
  };
};

export const rollTwo = (dice: number[]): LogLine => {
  return {
    event: LogEvent.RollTwo,
    dice,
  };
};

export const addTwo = (roll: number): LogLine => {
  return {
    event: LogEvent.AddTwo,
    roll,
  };
};

export const earn = (player: number, amount: number, name: string): LogLine => {
  return {
    event: LogEvent.Earn,
    player,
    amount,
    name,
  };
};

export const take = (args: { from: number; to: number }, amount: number, name: string): LogLine => {
  return {
    event: LogEvent.Take,
    ...args,
    amount,
    name,
  };
};

export const buy = (name: string): LogLine => {
  return {
    event: LogEvent.Buy,
    name,
  };
};

export const office = (obj: { player_est_name: string; opponent_est_name: string }, opponent: number): LogLine => {
  return {
    event: LogEvent.Office,
    ...obj,
    opponent,
  };
};

export const tunaRoll = (roll: number): LogLine => {
  return {
    event: LogEvent.TunaRoll,
    roll,
  };
};

export const endGame = (winner: number): LogLine => {
  return {
    event: LogEvent.EndGame,
    winner,
  };
};
