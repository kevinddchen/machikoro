//
// Utility functions for landmarks.
//

import * as Metadata from './metadata';
import { Expansion } from '../types';

import type * as Types from './types';
import type { MachikoroG } from '../types';

export { Metadata };
export type { Types };

type Landmark = Types.Landmark;
type _LandmarkData = Types._LandmarkData;

/**
 * @param a
 * @param b
 * @returns True if the landmarks are the same.
 */
export const isEqual = (a: Landmark, b: Landmark): boolean => {
  return a._id === b._id;
};

/**
 * @param G
 * @param land
 * @returns True if the landmark is in use for this game.
 */
export const isInUse = (G: MachikoroG, land: Landmark): boolean => {
  return G._landData!._inUse[land._id];
};

/**
 * @param G
 * @param player
 * @param land
 * @returns True if the player owns the landmark.
 */
export const owns = (G: MachikoroG, player: number, land: Landmark): boolean => {
  return G._landData!._owned[land._id][player];
};

/**
 * @param G
 * @returns List of all landmarks that are in use for this game.
 */
export const getAllInUse = (G: MachikoroG): Landmark[] => {
  const lands: Landmark[] = [];
  for (const land of Metadata.LANDMARKS) {
    if (isInUse(G, land)) {
      lands.push(land);
    }
  }
  return lands;
};

/**
 * @param data
 * @param player
 * @returns List of all landmarks owned by the player.
 */
export const getAllOwned = (G: MachikoroG, player: number): Landmark[] => {
  const lands: Landmark[] = [];
  for (const land of Metadata.LANDMARKS) {
    if (owns(G, player, land)) {
      lands.push(land);
    }
  }
  return lands;
};

/**
 * Update `G` to reflect a player buying a landmark.
 * @param G
 * @param player
 * @param land
 */
export const buy = (G: MachikoroG, player: number, land: Landmark): void => {
  G._landData!._owned[land._id][player] = true;
};

/**
 * Initialize the landmark data for a game by modifying `G`.
 * @param G
 * @param expansion
 * @param numPlayers
 */
export const initialize = (G: MachikoroG, expansion: Expansion, numPlayers: number): void => {
  const numLands = Metadata.LANDMARKS.length;
  const data: _LandmarkData = {
    _inUse: Array(numLands).fill(false),
    _owned: Array(numLands).fill(Array(numPlayers).fill(false)),
  };

  // initialize landmarks in use
  let ids: number[];
  switch (expansion) {
    case Expansion.Base: {
      ids = Metadata.BASE_LANDMARK_IDS;
      break;
    }
    case Expansion.Harbor: {
      ids = Metadata.HARBOR_LANDMARK_IDS;
      break;
    }
    default:
      throw new Error(`Expansion '${expansion}' not implemented.`);
  }

  for (const id of ids) {
    data._inUse[id] = true;
  }

  // update G
  G._landData = data;
};
