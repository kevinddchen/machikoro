//
// Utility functions for landmarks.
//

import * as Meta from './metadata';
import * as Meta2 from './metadata2';
import { Expansion, MachikoroG, SupplyVariant, Version } from '../types';
import { Landmark, LandmarkData } from './types';

/**
 * @param a
 * @param b
 * @returns True if the landmarks are the same.
 */
export const isEqual = (a: Landmark, b: Landmark): boolean => {
  return a._id === b._id && a.version === b.version;
};

/**
 * @param land
 * @param version
 * @param expansions
 * @returns True if the landmark is in use for this game.
 */
export const isInUse = (land: Landmark, version: Version, expansions: Expansion[]): boolean => {
  return version === land.version && expansions.includes(land.expansion);
};

/**
 * Returns true if the landmark is available for purchase. In Machi Koro 1,
 * landmarks should always be available for purchase.
 * @param G
 * @param land
 * @returns
 */
export const isAvailable = (G: MachikoroG, land: Landmark): boolean => {
  if (G.version !== land.version) {
    return false;
  }
  return G.landData._available[land._id];
};

/**
 * @param G
 * @param player
 * @param land
 * @returns True if the player owns the landmark.
 */
export const owns = (G: MachikoroG, player: number, land: Landmark): boolean => {
  if (G.version !== land.version) {
    return false;
  }
  return G.landData._owned[player][land._id];
};

/**
 * @param G
 * @param land
 * @returns True if the landmark is owned by any player.
 */
export const isOwned = (G: MachikoroG, land: Landmark): boolean => {
  if (G.version !== land.version) {
    return false;
  }
  return G.landData._owned.some((ownedArr) => ownedArr[land._id]);
};

/**
 * Get all landmarks for Machi Koro 1 or 2.
 * @param version
 * @returns
 */
const getAll = (version: Version): Landmark[] => {
  switch (version) {
    case Version.MK1:
      return Meta._LANDMARKS;
    case Version.MK2:
      return Meta2._LANDMARKS2;
  }
};

/**
 * @param version
 * @param expansions
 * @returns List of all landmarks that are in use for this game. The landmarks
 * are returned in the intended display order.
 */
export const getAllInUse = (version: Version, expansions: Expansion[]): Landmark[] => {
  return getAll(version).filter((land) => isInUse(land, version, expansions));
};

/**
 * @param G
 * @returns List of all landmarks that are available for purchase.
 */
export const getAllAvailable = (G: MachikoroG): Landmark[] => {
  return getAll(G.version).filter((land) => isAvailable(G, land));
};

/**
 * @param data
 * @param player
 * @returns List of all landmarks owned by the player. The landmarks are
 * returned in the intended display order.
 */
export const getAllOwned = (G: MachikoroG, player: number): Landmark[] => {
  return getAll(G.version).filter((land) => owns(G, player, land));
};

/**
 * @param G
 * @param player
 * @returns The number of landmarks built by the player, i.e. the number of
 * landmarks owned by the player other than "City Hall".
 */
export const countBuilt = (G: MachikoroG, player: number): number => {
  return getAllOwned(G, player).filter((land) => !isEqual(land, Meta.CityHall) && !isEqual(land, Meta2.CityHall2))
    .length;
};

/**
 * @param G
 * @param land
 * @param player
 * @returns The cost of the landmark for the player.
 */
export const cost = (G: MachikoroG, land: Landmark, player: number): number => {
  const version = G.version;
  const landCostArray = costArray(G, land, player);

  switch (version) {
    case Version.MK1:
      // Machi Koro 1 only has one cost
      return landCostArray[0];
    case Version.MK2: {
      // Machi Koro 2 landmark costs change based on the number of built landmarks
      const built = countBuilt(G, player);
      return landCostArray[built];
    }
  }
};

/**
 * @param G
 * @param land
 * @param player
 * @returns A copy of the cost array for the landmark. In Machi Koro 2, the
 * cost array may change based on the built landmarks.
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
  const version = G.version;
  if (version !== land.version) {
    throw new Error(`Landmark ${land.name} does not match the game version, ${G.version.toString()}.`);
  }
  G.landData._owned[player][land._id] = true;
  // in Machi Koro 2, each landmark can only be bought by one player
  if (version === Version.MK2) {
    G.landData._available[land._id] = false;
  }
};

/**
 * Update `G` to reflect a player demolishing a landmark. Only implemented for
 * Machi Koro 1.
 * @param G
 * @param player
 * @param land
 */
export const demolish = (G: MachikoroG, player: number, land: Landmark): void => {
  const version = G.version;
  if (version !== Version.MK1) {
    throw new Error('Demolishing landmarks is only implemented for Machi Koro 1.');
  } else if (version !== land.version) {
    throw new Error(`Landmark ${land.name} does not match the game version, ${G.version.toString()}.`);
  }
  G.landData._owned[player][land._id] = false;
};

/**
 * Replenish the landmark supply. This does nothing for Machi Koro 1.
 * @param G
 */
export const replenishSupply = (G: MachikoroG): void => {
  const { version, supplyVariant } = G;
  const deck = G.secret.landDeck;

  // skip if this is Machi Koro 1
  if (version === Version.MK1) {
    return;
  }

  switch (supplyVariant) {
    case SupplyVariant.Total: {
      // put all landmarks into the supply
      while (deck.length > 0) {
        const land = deck.pop()!;
        G.landData._available[land._id] = true;
      }
      break;
    }
    case SupplyVariant.Variable:
    case SupplyVariant.Hybrid: {
      // put landmarks into the supply until there are 5 unique landmarks
      while (deck.length > 0 && getAllAvailable(G).length < Meta2._MK2_LANDMARK_SUPPLY_LIMIT) {
        const land = deck.pop()!;
        G.landData._available[land._id] = true;
      }
      break;
    }
  }
};

/**
 * Output of landmark initialization.
 * @prop {LandmarkData} landData - The landmark data.
 * @prop {Landmark[]} landDeck - The landmark deck, for Machi Koro 2
 */
interface LandInitializeOutput {
  landData: LandmarkData;
  landDeck: Landmark[];
}

/**
 * Initialize the landmark data for a game.
 * @param version
 * @param expansions
 * @param numPlayers
 */
export const initialize = (version: Version, expansions: Expansion[], numPlayers: number): LandInitializeOutput => {
  const numLands = getAll(version).length;

  // initialize data structure
  const landData: LandmarkData = {
    _available: Array.from({ length: numLands }, () => false),
    _owned: Array.from({ length: numPlayers }, () => Array.from({ length: numLands }, () => false)),
  };

  // populate landmarks in use
  const inUse = getAllInUse(version, expansions);
  // in Machi Koro 1, landmarks are always available for purchase
  if (version === Version.MK1) {
    for (const land of inUse) {
      landData._available[land._id] = true;
    }
  }

  // give each player their starting landmarks
  let starting: number[];
  switch (version) {
    case Version.MK1: {
      starting = [];
      if (expansions.includes(Expansion.Harbor)) {
        starting.push(...Meta._HARBOR_STARTING_LANDMARKS);
      }
      break;
    }
    case Version.MK2: {
      starting = Meta2._MK2_STARTING_LANDMARKS;
      break;
    }
  }

  for (const id of starting) {
    for (const player of Array(numPlayers).keys()) {
      landData._owned[player][id] = true;
    }
  }

  // prepare deck
  let landDeck: Landmark[];
  switch (version) {
    case Version.MK1: {
      landDeck = [];
      break;
    }
    case Version.MK2: {
      landDeck = inUse.filter((land) => !isEqual(land, Meta2.CityHall2)); // manually exclude `CityHall2`
      break;
    }
  }

  return { landData, landDeck };
};
