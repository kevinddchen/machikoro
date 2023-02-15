//
// Types for landmarks.
//

/**
 * Interface for landmark metadata.
 * @prop {string} name - Display name.
 * @prop {string} description - Tooltip text.
 * @prop {string} imageFilename - Filename of full-sized image.
 * @prop {number} cost - Cost to buy.
 * @prop {number} _id - Unique id used to enumerate landmarks. (Private, do not access directly)
 */
export interface Landmark {
  readonly name: string;
  readonly description: string;
  readonly imageFilename: string;
  readonly cost: number;
  readonly _id: number;
}

/**
 * JSON-serializable object keeping track of landmark-related data during a
 * game. Should only be accessed within this module.
 * @prop {boolean[]} inUse - Array tracking which landmarks are in use. Indexed
 * by landmark ID.
 * @prop {boolean[][]} owned - Array tracking which landmarks are owned by each
 * player. Indexed by landmark ID then by player number.
 */
export interface LandmarkData {
  inUse: boolean[];
  owned: boolean[][];
}
