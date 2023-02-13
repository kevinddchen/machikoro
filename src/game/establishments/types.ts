//
// Types for establishments.
//

/**
 * Interface for establishment metadata.
 * @prop name - Display name.
 * @prop description - Tooltip text.
 * @prop imageFilename - Filename of full-sized image.
 * @prop miniFilename - Filename of miniature image.
 * @prop cost - Cost to buy.
 * @prop earnings - The earnings per activation (for simple effects).
 * @prop rolls - Which rolls activate the establishment.
 * @prop color - The color of the establishment.
 * @prop type - The type of the establishment (for combos, e.g. 'Animal').
 * @prop _id - Unique id used to enumerate establishments. (Private, do not access directly)
 */
export type Establishment = {
  readonly name: string;
  readonly description: string;
  readonly imageFilename: string;
  readonly miniFilename: string;
  readonly cost: number;
  readonly earnings: number;
  readonly rolls: number[];
  readonly color: EstColor;
  readonly type: EstType | null;
  readonly _id: number;
};

/**
 * JSON-serializable object keeping track of establishment-related data during
 * a game. Should only be accessed within this module.
 * @prop inUse - Array tracking which establishments are in use. Indexed by
 * establishment ID.
 * @prop remainingCount - Array tracking how many of each establishment are
 * remaining in the supply and deck. Indexed by establishment ID.
 * @prop availableCount - Array tracking how many of each establishment are
 * available to buy from the supply. Indexed by establishment ID.
 * @prop ownedCount - Array tracking how many of each establishment are owned
 * by each player. Indexed by establishment ID then by player number.
 */
export type EstablishmentData = {
  inUse: boolean[];
  remainingCount: number[];
  availableCount: number[];
  ownedCount: number[][];
};

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
 */
export const EstType = {
  Animal: 'Animal',
  Cup: 'Cup',
  Gear: 'Gear',
  Shop: 'Shop',
  Wheat: 'Wheat',
} as const;

export type EstType = (typeof EstType)[keyof typeof EstType];
