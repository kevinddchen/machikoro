//
// Types for establishments.
//

import type { Expansion, Version } from '../types';

/**
 * Interface for establishment metadata.
 * @prop version - Used to distinguish Machi Koro 1 and 2 establishments.
 * @prop expansion - For Machi Koro 1, the expansion the establishment belongs to.
 * @prop name - Display name.
 * @prop description - Tooltip text.
 * @prop cost - Cost to buy.
 * @prop earn - The earnings per activation (for simple effects).
 * @prop rolls - Which rolls activate the establishment.
 * @prop color - The color of the establishment.
 * @prop type - The type of the establishment (for combos, e.g. 'Animal').
 * @prop _id - Unique id used to enumerate establishments.
 * @prop _initial - The number of copies in the initial supply. If null, then is equal to the number of players.
 */
export interface Establishment {
  readonly version: Version;
  readonly expansion: Expansion;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly earn: number;
  readonly rolls: number[];
  readonly color: EstColor;
  readonly type: EstType | null;
  readonly _id: number;
  readonly _initial: number | null;
}

/**
 * JSON-serializable object keeping track of establishment-related data during
 * a game. Should only be accessed within this module.
 * @prop _remainingCount - Array tracking how many of each establishment are
 * remaining in the supply and deck. Indexed by establishment ID.
 * @prop _availableCount - Array tracking how many of each establishment are
 * available to buy from the supply. Indexed by establishment ID.
 * @prop _ownedCount - Array tracking how many of each establishment are owned
 * by each player. Indexed by player number then by establishment ID.
 * @prop _renovationCount - Array tracking how many of each establishment are
 * under renovation for each player. Indexed by player number then by
 * establishment ID.
 */
export interface EstablishmentData {
  _remainingCount: number[];
  _availableCount: number[];
  _ownedCount: number[][];
  _renovationCount: number[][];
}

/**
 * Establishment color enum.
 */
export const EstColor = {
  Blue: 'Blue',
  Green: 'Green',
  Purple: 'Purple',
  Red: 'Red',
} as const;

export type EstColor = (typeof EstColor)[keyof typeof EstColor];

/**
 * Establishment type enum.
 * Some establishments an establishment type which is displayed as an icon
 * on the establishment card. The icon is generated from the Material Symbols font
 * (https://developers.google.com/fonts/docs/material_symbols).
 * The following are the keywords used to identify each icon (padded with ::).
 */
export const EstType = {
  Animal: '::cruelty_free::',
  Cup: '::coffee::',
  Gear: '::settings::',
  Shop: '::house::',
  Wheat: '::psychiatry::',
  Fruit: '::nutrition::',
} as const;

export type EstType = (typeof EstType)[keyof typeof EstType];
