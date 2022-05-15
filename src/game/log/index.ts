import { LogEvent } from '../enums';
import { LogLine } from '../types';

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

export const earn = (obj: { to: number; amount: number }, name: string): LogLine => {
  return {
    event: LogEvent.Earn,
    ...obj,
    name,
  };
};

export const take = (obj: { from: number; to: number; amount: number }, name: string): LogLine => {
  return {
    event: LogEvent.Take,
    ...obj,
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
