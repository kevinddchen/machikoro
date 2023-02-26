//
// Types for Machikoro game.
//

import { Establishment, EstablishmentData } from './establishments/types';
import { Landmark, LandmarkData } from './landmarks/types';
import { LogEvent } from './log/types';

/**
 * The `G` object containing all game state variables.
 * @prop {Expansion} expansion - the expansion of the game.
 * @prop {SupplyVariant} supplyVariant - the supply variant of the game.
 * @prop {string[]} _turnOrder - the order of players in the game. Do not use
 * this property; use `ctx.playOrder` instead.
 * @prop {TurnState} turnState - the current player's turn state.
 * @prop {number|null} roll - the current player's dice roll total.
 * @prop {number} numRolls - the number of dice rolls made by the current player.
 * @prop {boolean} secondTurn - true if the current player can make another turn.
 * @prop {boolean} doTV - true if the current player will activate the TV station.
 * @prop {boolean} doOffice - true if the current player will activate the office.
 * @prop {Establishment|null} officeGiveEst - the establishment picked for the office to give.
 * @prop {Establishment|null} justBoughtEst - the establishment just bought (for prettier rendering).
 * @prop {number|null} tunaRoll - the roll made for the tuna boat.
 * @prop {Secret} secret - game state that is not passed to clients.
 * @prop {number[]} _coins - coins for each player. Do not use this property;
 * use `getCoins` and `setCoins` instead.
 * @prop {EstablishmentData|null} _estData - establishment data.
 * @prop {LandmarkData|null} _landData - landmark data.
 * @prop {LogEvent[]|null} _logBuffer - buffer of log lines.
 */
export interface MachikoroG {
  readonly expansion: Expansion;
  readonly supplyVariant: SupplyVariant;
  readonly _turnOrder: string[];
  turnState: TurnState;
  roll: number | null;
  numRolls: number;
  secondTurn: boolean;
  doTV: boolean;
  doOffice: boolean;
  officeGiveEst: Establishment | null;
  justBoughtEst: Establishment | null;
  tunaRoll: number | null;
  secret: Secret;
  _coins: number[];
  _estData: EstablishmentData | null;
  _landData: LandmarkData | null;
  _logBuffer: LogEvent[] | null;
}

/**
 * Game state that is not passed to the clients
 * @prop {Establishment[][]|null} _decks - the establishment draw decks.
 * @prop {Landmark[]|null} _landDeck - the landmark draw deck, for Machi Koro 2.
 */
export interface Secret {
  _decks: Establishment[][] | null;
  _landDeck: Landmark[] | null;
}

/**
 * Data needed to setup a game.
 * @prop {Expansion} expansion - Expansion of the game.
 * @prop {SupplyVariant} supplyVariant - Supply variant of the game.
 * @prop {number} startCoins - Number of coins each player starts with.
 * @prop {boolean} randomizeTurnOrder - True if the turn order should be randomized.
 */
export interface SetupData {
  expansion: Expansion;
  supplyVariant: SupplyVariant;
  startCoins: number;
  randomizeTurnOrder: boolean;
}

/**
 * Turn state enum.
 */
export const TurnState = {
  Roll: 'Roll',
  TV: 'TV',
  OfficeGive: 'OfficeGive',
  OfficeTake: 'OfficeTake',
  Buy: 'Buy',
  End: 'End',
} as const;

export type TurnState = (typeof TurnState)[keyof typeof TurnState];

/**
 * Expansion enum.
 */
export const Expansion = {
  Base: 'Base',
  Harbor: 'Harbor',
  MK2: 'MK2',
} as const;

export type Expansion = (typeof Expansion)[keyof typeof Expansion];

/**
 * Supply variant enum.
 */
export const SupplyVariant = {
  Total: 'Total',
  Variable: 'Variable',
  Hybrid: 'Hybrid',
} as const;

export type SupplyVariant = (typeof SupplyVariant)[keyof typeof SupplyVariant];
