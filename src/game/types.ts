//
// Types for Machikoro game.
//

import type { Establishment, EstablishmentData } from './establishments/types';
import type { Landmark, LandmarkData } from './landmarks/types';
import type { LogEvent } from './log';

/**
 * The `G` object containing all game state variables.
 * @prop version - the version of the game.
 * @prop expansions - the expansions used in the game.
 * @prop supplyVariant - the supply variant of the game.
 * @prop initialBuyRounds - the number of rounds of initial buying.
 * @prop _turnOrder - the order of players in the game. Do not use this
 * property; use `ctx.playOrder` instead.
 * @prop turnState - the current player's turn state.
 * @prop roll - the current player's dice roll total.
 * @prop rollDoubles - true if the current player rolled doubles.
 * @prop numDice - the number of dice rolled by the current player.
 * @prop numRolls - the number of dice rolls made by the current player.
 * @prop secondTurn - true if the current player can make another turn.
 * @prop doTV - number of times the current player will activate the TV Station.
 * @prop doOffice - number of times the current player will activate the Office.
 * @prop doMovingCompany - true if the current player will activate the Moving Company.
 * @prop officeGiveEst - the establishment picked for the Office to give.
 * @prop justBoughtEst - the establishment just bought.
 * @prop justBoughtLand - the landmark just bought.
 * @prop receivedCoins - true if the current player has received coins this turn.
 * @prop tunaRoll - the roll made for the tuna boat.
 * @prop secret - game state that is not passed to clients.
 * @prop _coins - coins for each player. Do not use this property; use
 * `getCoins` and `addCoins` instead.
 * @prop estData - establishment data.
 * @prop landData - landmark data.
 * @prop _logBuffer - buffer of log lines.
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
  landData: LandmarkData;
  _logBuffer: LogEvent[];
}

/**
 * Game state that is not passed to the clients
 * @prop estDecks - the establishment draw decks.
 * @prop landDeck - the landmark draw deck, for Machi Koro 2.
 */
export interface Secret {
  estDecks: Establishment[][];
  landDeck: Landmark[];
}

/**
 * Data needed to setup a game.
 * @prop version - Version of the game.
 * @prop expansions - Expansions used in the game.
 * @prop supplyVariant - Supply variant of the game.
 * @prop startCoins - Number of coins each player starts with.
 * @prop initialBuyRounds - Number of rounds of initial buying.
 * @prop randomizeTurnOrder - True if the turn order should be randomized.
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
  ActivateRedEsts: 10,
  ActivateBlueGreenEsts: 11,
  // MovingCompanyGive: 13,
  // MovingCompanyPick: 14,
  ActivatePurpleEsts: 15,
  TV: 16,
  OfficeGive: 17,
  OfficeTake: 18,
  ActivateLands: 20,
  MovingCompany2: 21,
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
