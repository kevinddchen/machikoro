//
// Types for landmarks.
//

import type { Expansion, Version } from '../types';

/**
 * Interface for landmark metadata.
 * @prop version - Used to distinguish Machi Koro 1 and 2 landmarks.
 * @prop expansion - For Machi Koro 1, the expansion the landmark belongs to.
 * @prop name - Display name.
 * @prop miniName - Display name in the player info.
 * @prop description - Tooltip text.
 * @prop cost - Cost to buy. In Machi Koro 2, the cost depends on the number of
 * landmarks already owned. It is recommended to use the `cost` function
 * instead of accessing this array.
 * @prop coins - Context depends on the landmark. May indicate
 * coins earned, bonus coins earned, etc.
 * @prop _id - Unique id used to enumerate landmarks.
 */
export interface Landmark {
  readonly version: Version;
  readonly expansion: Expansion;
  readonly name: string;
  readonly miniName: string;
  readonly description: string;
  readonly cost: number[];
  readonly coins: number | null;
  readonly _id: number;
}

/**
 * JSON-serializable object keeping track of landmark-related data during a
 * game. Should only be accessed within this module.
 * @prop _available - Array tracking which landmarks are available for
 * purchase. Landmarks are always available in Machi Koro 1. Indexed by
 * landmark ID.
 * @prop _owned - Array tracking which landmarks are owned by each player.
 * Indexed by player number then by landmark ID.
 */
export interface LandmarkData {
  _available: boolean[];
  _owned: boolean[][];
}
