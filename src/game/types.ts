//
// Types for Machikoro game.
//

import type { Establishment, EstablishmentData } from './establishments/types';
import type { Landmark, LandmarkData } from './landmarks/types';
import type { LogEvent } from './log';

/**
 * The `G` object containing all game state variables.
 * @prop {Version} version - the version of the game.
 * @prop {Expansion[]} expansions - the expansions used in the game.
 * @prop {SupplyVariant} supplyVariant - the supply variant of the game.
 * @prop {number} initialBuyRounds - the number of rounds of initial buying.
 * @prop {string[]} _turnOrder - the order of players in the game. Do not use
 * this property; use `ctx.playOrder` instead.
 * @prop {TurnState} turnState - the current player's turn state.
 * @prop {number} roll - the current player's dice roll total.
 * @prop {boolean} rollDoubles - true if the current player rolled doubles.
 * @prop {number} numDice - the number of dice rolled by the current player.
 * @prop {number} numRolls - the number of dice rolls made by the current player.
 * @prop {boolean} secondTurn - true if the current player can make another turn.
 * @prop {number} doTV - number of times the current player will activate the TV Station.
 * @prop {number} doOffice - number of times the current player will activate the Office.
 * @prop {boolean} doMovingCompany - true if the current player will activate the Moving Company.
 * @prop {Establishment|null} officeGiveEst - the establishment picked for the Office to give.
 * @prop {Establishment|null} justBoughtEst - the establishment just bought.
 * @prop {Landmark|null} justBoughtLand - the landmark just bought.
 * @prop {boolean} receivedCoins - true if the current player has received coins this turn.
 * @prop {number|null} tunaRoll - the roll made for the tuna boat.
 * @prop {Secret} secret - game state that is not passed to clients.
 * @prop {number[]} _coins - coins for each player. Do not use this property;
 * use `getCoins` and `addCoins` instead.
 * @prop {EstablishmentData|null} _estData - establishment data.
 * @prop {LandmarkData|null} _landData - landmark data.
 * @prop {LogEvent[]|null} _logBuffer - buffer of log lines.
 */
export interface MachikoroG {
  readonly version: Version;
  readonly expansions: Expansion[];
  readonly supplyVariant: SupplyVariant;
  readonly initialBuyRounds: number;
  readonly _turnOrder: string[];
  turnState: TurnState;
  roll: number;
  rollDoubles: boolean;
  numDice: number;
  numRolls: number;
  secondTurn: boolean;
  doTV: number;
  doOffice: number;
  doMovingCompany: boolean;
  officeGiveEst: Establishment | null;
  justBoughtEst: Establishment | null;
  justBoughtLand: Landmark | null;
  receivedCoins: boolean;
  tunaRoll: number | null;
  secret: Secret;
  _coins: number[];
  estData: EstablishmentData;
  _landData: LandmarkData | null;
  _logBuffer: LogEvent[];
}

/**
 * Game state that is not passed to the clients
 * @prop {Establishment[][]|null} _decks - the establishment draw decks.
 * @prop {Landmark[]|null} _landDeck - the landmark draw deck, for Machi Koro 2.
 */
export interface Secret {
  estDecks: Establishment[][];
  _landDeck: Landmark[] | null;
}

/**
 * Data needed to setup a game.
 * @prop {Version} version - Version of the game.
 * @prop {Expansion[]} expansions - Expansions used in the game.
 * @prop {SupplyVariant} supplyVariant - Supply variant of the game.
 * @prop {number} startCoins - Number of coins each player starts with.
 * @prop {number} initialBuyRounds - Number of rounds of initial buying.
 * @prop {boolean} randomizeTurnOrder - True if the turn order should be randomized.
 */
export interface SetupData {
  version: Version;
  expansions: Expansion[];
  supplyVariant: SupplyVariant;
  startCoins: number;
  initialBuyRounds: number;
  randomizeTurnOrder: boolean;
}

/**
 * Turn state enum. The order of the states in the turn is reflected in the
 * integer values--higher values are later in the turn.
 */
export const TurnState = {
  Roll: 0,
  ActivateEsts: 10,
  TV: 11,
  OfficeGive: 12,
  OfficeTake: 13,
  ActivateLands: 20,
  MovingCompany: 21,
  Buy: 30,
  ActivateBoughtLand: 31,
  End: 40,
} as const;

export type TurnState = (typeof TurnState)[keyof typeof TurnState];

/**
 * Expansion enum.
 */
export const Expansion = {
  Base: 'Base',
  Harbor: 'Harbor',
  Million: "Millionaire's Row",
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

/**
 * Version enum, for Machi Koro 1 or 2.
 */
export const Version = {
  MK1: 1,
  MK2: 2,
} as const;

export type Version = (typeof Version)[keyof typeof Version];
