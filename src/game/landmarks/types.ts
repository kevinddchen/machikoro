//
// Types for landmarks.
//

/**
 * Interface for landmark metadata.
 * @prop {string} name - Display name.
 * @prop {string} description - Tooltip text.
 * @prop {number[]} _cost - Cost to buy. In Machi Koro 2, the cost depends on
 * the number of landmarks already owned. Do not use this property; use the
 * `cost` function instead.
 * @prop {number|null} coins - Context depends on the landmark. May indicate
 * coins earned, bonus coins earned, etc.
 * @prop {number} _id - Unique id used to enumerate landmarks.
 */
export interface Landmark {
  readonly name: string;
  readonly description: string;
  readonly _cost: number[];
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
 * @prop {boolean[]} inSupply2 - Array tracking which landmarks are available
 * for purchase from the supply. Only used for Machi Koro 2. Indexed by
 * landmark ID.
 */
export interface LandmarkData {
  inUse: boolean[];
  owned: boolean[][];
  inSupply2: boolean[];
}
