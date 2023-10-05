//
// Utility functions for establishments.
//

import { assertNonNull, assertUnreachable } from 'common/typescript';

import * as Meta from './metadata';
import * as Meta2 from './metadata2';
import { EstColor, EstType, Establishment, EstablishmentData } from './types';
import { Expansion, MachikoroG, SupplyVariant, Version } from '../types';

/**
 * Type guard to assert that G._estData is not null to avoid using the non-null assertion operator "!".
 */
function assertEstDataExists(
  G: MachikoroG
): asserts G is MachikoroG & { _estData: NonNullable<MachikoroG['_estData']> } {
  if (G._estData === null || G._estData === undefined) {
    throw new Error('G._estData is null or undefined.');
  }
}

/**
 * Maximum number of unique establishments in the supply for Variable Supply.
 */
export const _VARIABLE_SUPPLY_LIMIT = 10;

/**
 * Maximum number of unique establishments that activate with rolls <= 6 in the
 * supply for Hybrid Supply.
 */
export const _HYBRID_SUPPY_LIMIT_LOWER = 5;

/**
 * Maximum number of unique establishments that activate with rolls > 6 in the
 * supply for Hybrid Supply.
 */
export const _HYBRID_SUPPY_LIMIT_UPPER = 5;

/**
 * Maximum number of unique major (purple) establishments in the supply for
 * Hybrid Supply.
 */
export const _HYBRID_SUPPY_LIMIT_MAJOR = 2;

/**
 * @param a
 * @param b
 * @returns True if the establishments are the same.
 */
export const isEqual = (a: Establishment, b: Establishment): boolean => {
  return a._id === b._id && a._ver === b._ver;
};

/**
 * @param G
 * @param est
 * @returns True if the establishment is in use for this game.
 */
export const isInUse = (G: MachikoroG, est: Establishment): boolean => {
  assertEstDataExists(G);
  return G.version === est._ver && G._estData.inUse[est._id];
};

/**
 * @param G
 * @param est
 * @returns The number of establishments of this kind that are still available
 * in the supply and deck.
 */
export const countRemaining = (G: MachikoroG, est: Establishment): number => {
  if (G.version !== est._ver) {
    throw new Error(`Establishment id=${est._id} ver=${est._ver} does not match the game version, ${G.version}.`);
  }
  assertEstDataExists(G);
  return G._estData.remainingCount[est._id];
};

/**
 * @param G
 * @param est
 * @returns The number of establishments of this kind that are available for
 * purchase from the supply.
 */
export const countAvailable = (G: MachikoroG, est: Establishment): number => {
  if (G.version !== est._ver) {
    throw new Error(`Establishment id=${est._id} ver=${est._ver} does not match the game version, ${G.version}.`);
  }
  assertEstDataExists(G);
  return G._estData.availableCount[est._id];
};

/**
 * @param G
 * @param player
 * @param est
 * @returns The number of establishments of this kind that are owned by the
 * player.
 */
export const countOwned = (G: MachikoroG, player: number, est: Establishment): number => {
  if (G.version !== est._ver) {
    throw new Error(`Establishment id=${est._id} ver=${est._ver} does not match the game version, ${G.version}.`);
  }
  assertEstDataExists(G);
  return G._estData.ownedCount[est._id][player];
};

/**
 * Get all establishments for Machi Koro 1 or 2.
 * @param G
 * @returns
 */
const getAll = (G: MachikoroG): Establishment[] => {
  const version = G.version;
  if (version === Version.MK1) {
    return Meta._ESTABLISHMENTS;
  } else if (version === Version.MK2) {
    return Meta2._ESTABLISHMENTS2;
  } else {
    return assertUnreachable(version);
  }
};

/**
 * @param G
 * @returns List of all unique establishments that are in use for this game.
 * The establishments are returned in the intended display order.
 */
export const getAllInUse = (G: MachikoroG): Establishment[] => {
  return getAll(G).filter((est) => isInUse(G, est));
};

/**
 * @param G
 * @returns List of all unique establishments that are available for purchase
 * from the supply.
 */
export const getAllAvailable = (G: MachikoroG): Establishment[] => {
  return getAll(G).filter((est) => countAvailable(G, est) > 0);
};

/**
 * @param G
 * @param player
 * @returns List of all unique establishments owned by the player. The
 * establishments are returned in the intended display order.
 */
export const getAllOwned = (G: MachikoroG, player: number): Establishment[] => {
  return getAll(G).filter((est) => countOwned(G, player, est) > 0);
};

/**
 * @param G
 * @param player
 * @param type
 * @returns The number of establishments that are owned by the player and have
 * the specified type.
 */
export const countTypeOwned = (G: MachikoroG, player: number, type: EstType): number => {
  return getAll(G)
    .filter((est) => est.type === type)
    .reduce((acc, est) => acc + countOwned(G, player, est), 0);
};

/**
 * Update `G` to reflect a player buying an establishment.
 * @param G
 * @param player
 * @param est
 */
export const buy = (G: MachikoroG, player: number, est: Establishment): void => {
  if (G.version !== est._ver) {
    throw new Error(`Establishment id=${est._id} ver=${est._ver} does not match the game version, ${G.version}.`);
  }
  assertEstDataExists(G);
  G._estData.remainingCount[est._id] -= 1;
  G._estData.availableCount[est._id] -= 1;
  G._estData.ownedCount[est._id][player] += 1;
};

/**
 * Update `G` to reflect an establishment transferring ownership.
 * @param G
 * @param args.from - Source player.
 * @param args.to - Destination player.
 * @param est - Establishment in question.
 */
export const transfer = (G: MachikoroG, args: { from: number; to: number }, est: Establishment): void => {
  if (G.version !== est._ver) {
    throw new Error(`Establishment id=${est._id} ver=${est._ver} does not match the game version, ${G.version}.`);
  }
  assertEstDataExists(G);
  G._estData.ownedCount[est._id][args.from] -= 1;
  G._estData.ownedCount[est._id][args.to] += 1;
};

/**
 * Replenish the supply.
 * @param G
 */
export const replenishSupply = (G: MachikoroG): void => {
  const { version, supplyVariant } = G;
  const decks = G.secret._decks;
  assertNonNull(decks);

  if (supplyVariant === SupplyVariant.Total) {
    // put all establishments into the supply
    while (decks[0].length > 0) {
      const est = decks[0].pop();
      assertNonNull(est);
      assertEstDataExists(G);
      G._estData.availableCount[est._id] += 1;
    }
  } else if (supplyVariant === SupplyVariant.Variable) {
    // put establishments into the supply until there are ten unique establishments
    while (decks[0].length > 0 && getAllAvailable(G).length < _VARIABLE_SUPPLY_LIMIT) {
      const est = decks[0].pop();
      assertNonNull(est);
      assertEstDataExists(G);
      G._estData.availableCount[est._id] += 1;
    }
  } else if (supplyVariant === SupplyVariant.Hybrid) {
    // put establishments into the supply until there are 5 unique
    // establishments with activation <= 6 and 5 establishments with activation
    // > 6 (and for Machi Koro 1, 2 major establishments).

    const limits = [_HYBRID_SUPPY_LIMIT_LOWER, _HYBRID_SUPPY_LIMIT_UPPER, _HYBRID_SUPPY_LIMIT_MAJOR];

    let funcs: ((est: Establishment) => boolean)[];
    if (version === Version.MK1) {
      funcs = [(est) => isLower(est) && !isMajor(est), (est) => isUpper(est) && !isMajor(est), isMajor];
    } else if (version === Version.MK2) {
      funcs = [isLower, isUpper];
    } else {
      return assertUnreachable(version);
    }

    for (let i = 0; i < decks.length; i++) {
      while (decks[i].length > 0 && getAllAvailable(G).filter(funcs[i]).length < limits[i]) {
        const est = decks[i].pop();
        assertNonNull(est);
        assertEstDataExists(G);
        G._estData.availableCount[est._id] += 1;
      }
    }
  } else {
    return assertUnreachable(supplyVariant);
  }
};

/**
 * Initialize the establishment data for a game by modifying `G`.
 * @param G
 */
export const initialize = (G: MachikoroG, numPlayers: number): void => {
  const { version, expansions, supplyVariant } = G;
  const ests = getAll(G);
  const numEsts = ests.length;

  // initialize data structure
  const data: EstablishmentData = {
    inUse: Array.from({ length: numEsts }, () => false),
    remainingCount: Array.from({ length: numEsts }, () => 0),
    availableCount: Array.from({ length: numEsts }, () => 0),
    ownedCount: Array.from({ length: numEsts }, () => Array.from({ length: numPlayers }, () => 0)),
  };

  // get establishments in use, starting establishments
  let ids: number[];
  let starting: number[];
  if (version === Version.MK1) {
    ids = [];
    if (expansions.includes(Expansion.Base)) {
      ids.push(...Meta._BASE_ESTABLISHMENTS);
    }
    if (expansions.includes(Expansion.Harbor)) {
      ids.push(...Meta._HARBOR_ESTABLISHMENTS);
    }
    starting = Meta._STARTING_ESTABLISHMENTS;
  } else if (version === Version.MK2) {
    ids = Meta2._MK2_ESTABLISHMENTS;
    starting = Meta2._MK2_STARTING_ESTABLISHMENTS;
  } else {
    return assertUnreachable(version);
  }

  // populate establishments in use
  for (const id of ids) {
    const est = ests[id];
    data.inUse[id] = true;
    // if `est._initial` is null, use the number of players
    data.remainingCount[id] = est._initial ?? numPlayers;
  }

  // give each player their starting establishments
  for (const id of starting) {
    for (const player of Array(numPlayers).keys()) {
      data.ownedCount[id][player] += 1;
    }
  }

  // prepare decks
  let decks: Establishment[][];
  if (supplyVariant === SupplyVariant.Total || supplyVariant === SupplyVariant.Variable) {
    // put all cards into one deck
    decks = [[]];
    for (const id of ids) {
      const est = ests[id];
      decks[0].push(...Array.from({ length: data.remainingCount[id] }, () => est));
    }
  } else if (supplyVariant === SupplyVariant.Hybrid) {
    if (version === Version.MK1) {
      // put all cards into three decks: lower, upper, and major (purple)
      decks = [[], [], []];
      for (const id of ids) {
        const est = ests[id];
        if (isMajor(est)) {
          decks[2].push(...Array.from({ length: data.remainingCount[id] }, () => est));
        } else if (isLower(est)) {
          decks[0].push(...Array.from({ length: data.remainingCount[id] }, () => est));
        } else {
          decks[1].push(...Array.from({ length: data.remainingCount[id] }, () => est));
        }
      }
    } else if (version === Version.MK2) {
      // put all cards into two decks: lower and upper
      decks = [[], []];
      for (const id of ids) {
        const est = ests[id];
        if (isLower(est)) {
          decks[0].push(...Array.from({ length: data.remainingCount[id] }, () => est));
        } else {
          decks[1].push(...Array.from({ length: data.remainingCount[id] }, () => est));
        }
      }
    } else {
      return assertUnreachable(version);
    }
  } else {
    return assertUnreachable(supplyVariant);
  }

  // update G
  G._estData = data;
  G.secret._decks = decks;
};

/**
 * @param est
 * @returns True if the establishment activates on rolls <= 6.
 */
const isLower = (est: Establishment): boolean => {
  return est.rolls[0] <= 6;
};

/**
 * @param est
 * @returns True if the establishment activates on rolls > 6.
 */
const isUpper = (est: Establishment): boolean => {
  return est.rolls[0] > 6;
};

/**
 * @param est
 * @returns True if the establishment is major (purple).
 */
export const isMajor = (est: Establishment): boolean => {
  return est.color === EstColor.Purple;
};
