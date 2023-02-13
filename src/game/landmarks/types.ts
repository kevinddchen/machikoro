//
// Types for landmarks.
//

/**
 * Interface for landmark metadata.
 * @prop name - Display name.
 * @prop description - Tooltip text.
 * @prop imageFilename - Filename of full-sized image.
 * @prop cost - Cost to buy.
 * @prop _id - Unique id used to enumerate landmarks. (Private, do not access
 * directly)
 */
export type Landmark = {
  readonly name: string;
  readonly description: string;
  readonly imageFilename: string;
  readonly cost: number;
  readonly _id: number;
};

/**
 * JSON-serializable object keeping track of landmark-related data during a
 * game. Should only be accessed within this module.
 * @prop inUse - Array tracking which landmarks are in use. Indexed by
 * landmark ID.
 * @prop owned - Array tracking which landmarks are owned by each player.
 * Indexed by landmark ID then by player number.
 */
export type LandmarkData = {
  inUse: boolean[];
  owned: boolean[][];
};
