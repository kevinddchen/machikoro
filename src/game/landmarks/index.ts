//
// Utility functions for landmarks.
//

import * as Meta from './metadata';
import * as Meta2 from './metadata2';
import { Expansion, SupplyVariant, Version, expToVer } from '../config';
import { Landmark, LandmarkData } from './types';
import { MachikoroG } from '../types';

export * from './metadata';
export * from './metadata2';
export * from './types';

/**
 * @param a
 * @param b
 * @returns True if the landmarks are the same.
 */
export const isEqual = (a: Landmark, b: Landmark): boolean => {
  return a._id === b._id && a._ver === b._ver;
};

/**
 * @param G
 * @param land
 * @returns True if the landmark is in use for this game.
 */
export const isInUse = (G: MachikoroG, land: Landmark): boolean => {
  return expToVer(G.expansion) === land._ver && G._landData!.inUse[land._id];
};

/**
 * Returns true if the landmark is available for purchase. In Machi Koro 1,
 * landmarks should always be available for purchase.
 * @param G
 * @param land
 * @returns
 */
export const isAvailable = (G: MachikoroG, land: Landmark): boolean => {
  if (expToVer(G.expansion) !== land._ver) {
    console.warn(`Landmark id=${land._id} ver=${land._ver} does not match the game expansion, ${G.expansion}.`);
    return false;
  }
  return G._landData!.available[land._id];
};

/**
 * @param G
 * @param player
 * @param land
 * @returns True if the player owns the landmark.
 */
export const owns = (G: MachikoroG, player: number, land: Landmark): boolean => {
  if (expToVer(G.expansion) !== land._ver) {
    // this is used often for hard-coded landmarks, so no need to warn
    return false;
  }
  return G._landData!.owned[land._id][player];
};

/**
 * @param G
 * @param land
 * @returns True if the landmark is owned by any player.
 */
export const isOwned = (G: MachikoroG, land: Landmark): boolean => {
  if (expToVer(G.expansion) !== land._ver) {
    // this is used often for hard-coded landmarks, so no need to warn
    return false;
  }
  return G._landData!.owned[land._id].some((owned) => owned);
};

/**
 * Get all landmarks for Machi Koro 1 or 2.
 * @param G
 * @returns
 */
const getAll = (G: MachikoroG): Landmark[] => {
  const version = expToVer(G.expansion);
  if (version === Version.MK1) {
    return Meta._LANDMARKS;
  } else if (version === Version.MK2) {
    return Meta2._LANDMARKS2;
  } else {
    throw new Error(`Version '${version}' not implemented.`);
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
 * @param G
 * @returns List of all landmarks that are available for purchase.
 */
export const getAllAvailable = (G: MachikoroG): Landmark[] => {
  return getAll(G).filter((land) => isAvailable(G, land));
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
 * @returns The number of landmarks built by the player, i.e. the number of
 * landmarks owned by the player other than "City Hall".
 */
export const countBuilt = (G: MachikoroG, player: number): number => {
  if (expToVer(G.expansion) !== Version.MK2) {
    console.error(`'countBuilt()' is only implemented for Machi Koro 2.`);
  }
  return getAllOwned(G, player).filter((land) => !isEqual(land, Meta2.CityHall2)).length;
};

/**
 * @param G
 * @param land
 * @param player
 * @returns The cost of the landmark for the player.
 */
export const cost = (G: MachikoroG, land: Landmark, player: number): number => {
  const version = expToVer(G.expansion);
  const landCostArray = costArray(G, land, player);
  if (version === Version.MK1) {
    // Machi Koro 1 only has one cost
    return landCostArray[0];
  } else if (version === Version.MK2) {
    // Machi Koro 2 landmark costs change based on the number of built landmarks
    const built = countBuilt(G, player);
    const costIdx = Math.min(Math.max(built, 0), land.cost.length - 1); // avoid array out of bounds
    return landCostArray[costIdx];
  } else {
    throw new Error(`Version '${version}' not implemented.`);
  }
};

/**
 * @param G
 * @param land
 * @param player
 * @returns A copy of the cost array for the landmark. In Machi Koro 2, the
 * cost array may change based on the number of built landmarks.
 */
export const costArray = (G: MachikoroG, land: Landmark, player: number | null): number[] => {
  let arr = [...land.cost];

  if (isEqual(land, Meta2.LaunchPad2) && isOwned(G, Meta2.Observatory2)) {
    // if anyone owns Observatory, Launch Pad costs 5 fewer coins
    arr = arr.map((cost) => cost - Meta2.Observatory2.coins!);
  }
  if (player !== null && owns(G, player, Meta2.LoanOffice2)) {
    // if the player owns Loan Office, all landmarks cost 2 fewer coins
    arr = arr.map((cost) => cost - Meta2.LoanOffice2.coins!);
  }

  return arr;
};

/**
 * Update `G` to reflect a player buying a landmark.
 * @param G
 * @param player
 * @param land
 */
export const buy = (G: MachikoroG, player: number, land: Landmark): void => {
  const version = expToVer(G.expansion);
  if (version !== land._ver) {
    throw new Error(`Landmark id=${land._id} ver=${land._ver} does not match the game expansion, ${G.expansion}.`);
  }
  G._landData!.owned[land._id][player] = true;
  // in Machi Koro 2, each landmark can only be bought by one player
  if (version === Version.MK2) {
    G._landData!.available[land._id] = false;
  }
};

/**
 * Replenish the landmark supply. This does nothing for Machi Koro 1.
 * @param G
 */
export const replenishSupply = (G: MachikoroG): void => {
  const { expansion, supplyVariant } = G;
  const deck = G.secret._landDeck!;

  // skip if this is Machi Koro 1
  if (expToVer(expansion) === Version.MK1) {
    return;
  }

  if (supplyVariant === SupplyVariant.Total) {
    // put all landmarks into the supply
    while (deck.length > 0) {
      const land = deck.pop()!;
      G._landData!.available[land._id] = true;
    }
  } else if (supplyVariant === SupplyVariant.Variable || supplyVariant === SupplyVariant.Hybrid) {
    // put landmarks into the supply until there are 5 unique landmarks
    while (deck.length > 0 && getAllAvailable(G).length < Meta2._SUPPY_LIMIT_LANDMARK) {
      const land = deck.pop()!;
      G._landData!.available[land._id] = true;
    }
  } else {
    throw new Error(`Supply variant '${supplyVariant}' not implemented.`);
  }
};

/**
 * Initialize the landmark data for a game by modifying `G`.
 * @param G
 */
export const initialize = (G: MachikoroG, numPlayers: number): void => {
  const { expansion } = G;
  const version = expToVer(expansion);
  const lands = getAll(G);
  const numLands = lands.length;

  // initialize data structure
  const data: LandmarkData = {
    inUse: Array(numLands).fill(false),
    available: Array(numLands).fill(false),
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
    // in Machi Koro 1, landmarks are always available for purchase
    if (version === Version.MK1) {
      data.available[id] = true;
    }
  }

  // give each player their starting landmarks
  for (const id of starting) {
    for (const player of Array(numPlayers).keys()) {
      data.owned[id][player] = true;
    }
  }

  // prepare deck for Machi Koro 2. We manually exclude `CityHall2`.
  const deck = version === Version.MK2 ? lands.filter((land) => !isEqual(land, Meta2.CityHall2)) : [];

  // update G
  G._landData = data;
  G.secret._landDeck = deck;
};
