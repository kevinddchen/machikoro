//
// Types for landmarks.
//

import type { Version } from '../types';

/**
 * Interface for landmark metadata.
 * @prop {string} name - Display name.
 * @prop {string} miniName - Display name in the player info.
 * @prop {string} description - Tooltip text.
 * @prop {number[]} cost - Cost to buy. In Machi Koro 2, the cost depends on
 * the number of landmarks already owned. It is recommended to use the `cost`
 * function instead of accessing this array.
 * @prop {number|null} coins - Context depends on the landmark. May indicate
 * coins earned, bonus coins earned, etc.
 * @prop {number} _id - Unique id used to enumerate landmarks.
 * @prop {Version} _ver - Used to distinguish Machi Koro 1 and 2 landmarks.
 */
export interface Landmark {
  readonly name: string;
  readonly miniName: string;
  readonly description: string;
  readonly cost: number[];
  readonly coins: number | null;
  readonly _id: number;
  readonly _ver: Version;
}

/**
 * JSON-serializable object keeping track of landmark-related data during a
 * game. Should only be accessed within this module.
 * @prop {boolean[]} inUse - Array tracking which landmarks are in use. Indexed
 * by landmark ID.
 * @prop {boolean[]} available - Array tracking which landmarks are available
 * for purchase. Landmarks are always available in Machi Koro 1. Indexed by
 * landmark ID.
 * @prop {boolean[][]} owned - Array tracking which landmarks are owned by each
 * player. Indexed by landmark ID then by player number.
 */
export interface LandmarkData {
  inUse: boolean[];
  available: boolean[];
  owned: boolean[][];
}
