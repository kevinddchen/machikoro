import { Establishment, _EstablishmentData } from './establishments/types';
import { LogLine } from './log/types';
import { _LandmarkData } from './landmarks/types';

/**
 * The `G` object containing all game state variables.
 * @param turnState   the current player's turn state.
 * @param roll        the current player's dice roll total.
 * @param numRolls    the number of dice rolls made by the current player.
 */
export type MachikoroG = {
  readonly expansion: Expansion;
  readonly supplyVariant: SupplyVariant;
  readonly _playOrder: string[];
  turnState: TurnState; // tracks game state
  roll: number | null; // player's dice roll total
  numRolls: number; // number of rolls made this turn
  secondTurn: boolean; // true if player can make another turn
  doTV: boolean; // true if player will activate TV
  doOffice: boolean; // true if player will activate office
  officeGiveEst: Establishment | null; // establishment picked for office
  justBoughtEst: Establishment | null; // establishment just bought (for prettier rendering)
  tunaRoll: number | null; // roll made for tuna boat
  tunaHasRolled: boolean; // true if tuna boat has rolled
  secret: Secrets; // game state that is not passed to clients (e.g. establishment deck)
  _money: number[]; // money for each player
  _estData: _EstablishmentData | null;
  _landData: _LandmarkData | null;
  _logBuffer: LogLine[]; // temporarily stores `LogLine` objects for each move
};

export type Secrets = {
  _decks: Establishment[][] | null;
};

export const TurnState = {
  Roll: 'Roll',
  TV: 'TV',
  OfficeGive: 'OfficeGive',
  OfficeTake: 'OfficeTake',
  Buy: 'Buy',
  End: 'End',
} as const;

export type TurnState = (typeof TurnState)[keyof typeof TurnState];

export const Expansion = {
  Base: 'Base',
  Harbor: 'Harbor',
} as const;

export type Expansion = (typeof Expansion)[keyof typeof Expansion];

export const SupplyVariant = {
  Total: 'Total',
  Variable: 'Variable',
  Hybrid: 'Hybrid',
} as const;

export type SupplyVariant = (typeof SupplyVariant)[keyof typeof SupplyVariant];

export type Moves = Record<string, (...args: any[]) => void>;
