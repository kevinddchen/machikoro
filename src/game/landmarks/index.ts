//
// Utility functions for landmarks.
//

import * as Meta from './metadata';
import * as Meta2 from './metadata2';
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
 * 
 * @param G 
 * @param land
 * @returns True if the landmark is owned by any player. 
 */
export const isOwned = (G: MachikoroG, land: Landmark): boolean => {
  return G._landData!.owned[land._id].some((owned) => owned);
};

/**
 * Get all landmarks for Machi Koro 1 or 2.
 * @param G
 * @returns
 */
const getAll = (G: MachikoroG): Landmark[] => {
  if (G.expansion === Expansion.Base || G.expansion === Expansion.Harbor) {
    return Meta._LANDMARKS;
  } else if (G.expansion === Expansion.MK2) {
    return Meta2._LANDMARKS2;
  } else {
    throw new Error(`Expansion '${G.expansion}' not implemented.`);
  }
};

/**
 * @param G
 * @returns List of all landmarks that are in use for this game. The landmarks
 * are returned in the intended display order.
 */
export const getAllInUse = (G: MachikoroG): Landmark[] => {
  return getAll(G).filter((land) => isInUse(G, land));
};

/**
 * @param data
 * @param player
 * @returns List of all landmarks owned by the player. The landmarks are
 * returned in the intended display order.
 */
export const getAllOwned = (G: MachikoroG, player: number): Landmark[] => {
  return getAll(G).filter((land) => owns(G, player, land));
};

/**
 * @param G 
 * @param player 
 * @returns Return the number of landmarks owned by the player.
 */
export const countAllOwned = (G: MachikoroG, player: number): number => {
  return getAllOwned(G, player).length;
};

/**
 * @param G 
 * @param land 
 * @param player 
 * @returns The cost of the landmark for the player.
 */
export const cost = (G: MachikoroG, land: Landmark, player: number | null): number => {
  const { expansion } = G;
  if (expansion === Expansion.Base || expansion === Expansion.Harbor) {
    // Machi Koro 1 only has one cost
    return land._cost[0];
  } else if (expansion === Expansion.MK2) {
    // Machi Koro 2 landmark costs change based on the number of landmarks owned
    const landsOwned = player === null ? 0 : countAllOwned(G, player) - 1; // -1 because city hall does not count
    const costIdx = Math.min(Math.max(landsOwned, 0), land._cost.length - 1); // avoid array out of bounds
    return land._cost[costIdx];
  } else {
    throw new Error(`Expansion '${expansion}' not implemented.`);
  }
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
  const lands = getAll(G);
  const numLands = lands.length;

  // initialize data structure
  const data: LandmarkData = {
    inUse: Array(numLands).fill(false),
    owned: Array(numLands)
      .fill(null)
      .map(() => Array(numPlayers).fill(false)),
  };

  // initialize landmarks in use, starting landmarks
  let ids: number[];
  let starting: number[];
  if (expansion === Expansion.Base) {
    ids = Meta._BASE_LANDMARKS;
    starting = Meta._BASE_STARTING_LANDMARKS;
  } else if (expansion === Expansion.Harbor) {
    ids = Meta._HARBOR_LANDMARKS;
    starting = Meta._HARBOR_STARTING_LANDMARKS;
  } else if (expansion === Expansion.MK2) {
    ids = Meta2._MK2_LANDMARKS;
    starting = Meta2._MK2_STARTING_LANDMARKS;
  } else {
    throw new Error(`Expansion '${expansion}' not implemented.`);
  }

  // populate landmarks in use
  for (const id of ids) {
    data.inUse[id] = true;
  }

  // give each player their starting landmarks
  for (const id of starting) {
    for (const player of Array(numPlayers).keys()) {
      data.owned[id][player] = true;
    }
  }

  // update G
  G._landData = data;
};
