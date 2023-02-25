//
// Utility functions for landmarks.
//

import * as Meta from './metadata';
import { Expansion, MachikoroG } from '../types';
import { Landmark, LandmarkData } from './types';

export * from './metadata';
export * from './types';

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
  return G._landData!.inUse[land._id];
};

/**
 * @param G
 * @param player
 * @param land
 * @returns True if the player owns the landmark.
 */
export const owns = (G: MachikoroG, player: number, land: Landmark): boolean => {
  return G._landData!.owned[land._id][player];
};

/**
 * @param G
 * @returns List of all landmarks that are in use for this game. The landmarks
 * are returned in the intended display order.
 */
export const getAllInUse = (G: MachikoroG): Landmark[] => {
  return Meta.LANDMARKS.filter((land) => isInUse(G, land));
};

/**
 * @param data
 * @param player
 * @returns List of all landmarks owned by the player. The landmarks are
 * returned in the intended display order.
 */
export const getAllOwned = (G: MachikoroG, player: number): Landmark[] => {
  return Meta.LANDMARKS.filter((land) => owns(G, player, land));
};

/**
 * Update `G` to reflect a player buying a landmark.
 * @param G
 * @param player
 * @param land
 */
export const buy = (G: MachikoroG, player: number, land: Landmark): void => {
  G._landData!.owned[land._id][player] = true;
};

/**
 * Initialize the landmark data for a game by modifying `G`.
 * @param G
 */
export const initialize = (G: MachikoroG, numPlayers: number): void => {
  const { expansion } = G;
  const numLands = Meta.LANDMARKS.length;

  const data: LandmarkData = {
    inUse: Array(numLands).fill(false),
    owned: Array(numLands)
      .fill(null)
      .map(() => Array(numPlayers).fill(false)),
  };

  // initialize landmarks in use
  let ids: number[];
  switch (expansion) {
    case Expansion.Base: {
      ids = Meta._BASE_LANDMARK_IDS;
      break;
    }
    case Expansion.Harbor: {
      ids = Meta._HARBOR_LANDMARK_IDS;
      break;
    }
    default: {
      throw new Error(`Expansion '${expansion}' not implemented.`);
    }
  }

  for (const id of ids) {
    data.inUse[id] = true;
  }

  // give each player their starting landmarks
  for (const id of Meta._STARTING_LANDMARK_IDS) {
    if (!data.inUse[id]) {
      continue;
    }
    for (const player of Array(numPlayers).keys()) {
      data.owned[id][player] = true;
    }
  }

  // update G
  G._landData = data;
};
