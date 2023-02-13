//
// Types for Machikoro game.
//

import { Establishment, EstablishmentData } from './establishments/types';
import { LandmarkData } from './landmarks/types';
import { LogEvent } from './log/types';

/**
 * The `G` object containing all game state variables.
 * @param expansion - the expansion of the game.
 * @param supplyVariant - the supply variant of the game.
 * @param _turnOrder - the order of players in the game. (Private, do not access directly)
 * @param turnState - the current player's turn state.
 * @param roll - the current player's dice roll total.
 * @param numRolls - the number of dice rolls made by the current player.
 * @param secondTurn - true if the current player can make another turn.
 * @param doTV - true if the current player will activate the TV station.
 * @param doOffice - true if the current player will activate the office.
 * @param officeGiveEst - the establishment picked for the office to give.
 * @param justBoughtEst - the establishment just bought (for prettier rendering).
 * @param tunaRoll - the roll made for the tuna boat.
 * @param secret - game state that is not passed to clients.
 * @param _coins - coins for each player. (Private, do not access directly)
 * @param _estData - establishment data. (Private, do not access directly)
 * @param _landData - landmark data. (Private, do not access directly)
 * @param _logBuffer - buffer of log lines. (Private, do not access directly)
 */
export type MachikoroG = {
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
  secret: Secrets;
  _coins: number[];
  _estData: EstablishmentData | null;
  _landData: LandmarkData | null;
  _logBuffer: LogEvent[] | null;
};

/**
 * Game state that is not passed to the clients
 * @param _decks - the establishment draw decks. (Private, do not access directly)
 */
export type Secrets = {
  _decks: Establishment[][] | null;
};

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
