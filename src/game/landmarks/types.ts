//
// Types for landmarks.
//

/**
 * Interface for landmark metadata.
 * @prop {string} name - Display name.
 * @prop {string} description - Tooltip text.
 * @prop {number[]} cost - Cost to buy.
 * @prop {number|null} coins - Context depends on the landmark. May indicate
 * coins earned, bonus coins earned, etc.
 * @prop {number} _id - Unique id used to enumerate landmarks. (Private, do not
 * access directly)
 */
export interface Landmark {
  readonly name: string;
  readonly description: string;
  readonly cost: number[];
  readonly coins: number | null;
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
