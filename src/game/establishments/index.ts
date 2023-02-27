//
// Utility functions for establishments.
//

import * as Meta from './metadata';
import * as Meta2 from './metadata2';
import { EstColor, EstType, Establishment, EstablishmentData } from './types';
import { Expansion, MachikoroG, SupplyVariant } from '../types';

export * from './metadata';
export * from './metadata2';
export * from './types';

/**
 * @param a
 * @param b
 * @returns True if the establishments are the same.
 */
export const isEqual = (a: Establishment, b: Establishment): boolean => {
  return a._id === b._id && a._expId === b._expId;
};

/**
 * @param G
 * @param est
 * @returns True if the establishment is in use for this game.
 */
export const isInUse = (G: MachikoroG, est: Establishment): boolean => {
  return G._estData!.inUse[est._id];
};

/**
 * @param G
 * @param est
 * @returns The number of establishments of this kind that are still available
 * in the supply and deck.
 */
export const countRemaining = (G: MachikoroG, est: Establishment): number => {
  return G._estData!.remainingCount[est._id];
};

/**
 * @param G
 * @param est
 * @returns The number of establishments of this kind that are available for
 * purchase from the supply.
 */
export const countAvailable = (G: MachikoroG, est: Establishment): number => {
  return G._estData!.availableCount[est._id];
};

/**
 * @param G
 * @param player
 * @param est
 * @returns The number of establishments of this kind that are owned by the
 * player.
 */
export const countOwned = (G: MachikoroG, player: number, est: Establishment): number => {
  return G._estData!.ownedCount[est._id][player];
};

/**
 * Get all establishments for Machi Koro 1 or 2.
 * @param G
 * @returns
 */
const getAll = (G: MachikoroG): Establishment[] => {
  if (G.expansion === Expansion.Base || G.expansion === Expansion.Harbor) {
    return Meta._ESTABLISHMENTS;
  } else if (G.expansion === Expansion.MK2) {
    return Meta2._ESTABLISHMENTS2;
  } else {
    throw new Error(`Expansion '${G.expansion}' not implemented.`);
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
  // prettier-ignore
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
  G._estData!.remainingCount[est._id] -= 1;
  G._estData!.availableCount[est._id] -= 1;
  G._estData!.ownedCount[est._id][player] += 1;
};

/**
 * Update `G` to reflect an establishment transferring ownership.
 * @param G
 * @param args.from - Source player.
 * @param args.to - Destination player.
 * @param args.est - Establishment in question.
 */
export const transfer = (G: MachikoroG, args: { from: number; to: number; est: Establishment }): void => {
  G._estData!.ownedCount[args.est._id][args.from] -= 1;
  G._estData!.ownedCount[args.est._id][args.to] += 1;
};

/**
 * Replenish the supply.
 * @param G
 */
export const replenishSupply = (G: MachikoroG): void => {
  const { supplyVariant } = G;
  const decks = G.secret._decks!;

  if (supplyVariant === SupplyVariant.Total) {
    // put all establishments into the supply
    while (decks[0].length > 0) {
      const est = decks[0].pop()!;
      G._estData!.availableCount[est._id] += 1;
    }
  } else if (supplyVariant === SupplyVariant.Variable) {
    // put establishments into the supply until there are ten unique establishments
    while (decks[0].length > 0 && getAllAvailable(G).length < Meta._VARIABLE_SUPPLY_LIMIT) {
      const est = decks[0].pop()!;
      G._estData!.availableCount[est._id] += 1;
    }
  } else if (supplyVariant === SupplyVariant.Hybrid) {
    // put establishments into the supply until there are 5 unique
    // establishments with activation <= 6 and 5 establishments with activation
    // > 6 (and for Machi Koro 1, 2 major establishments).

    // prettier-ignore
    const limits = [
      Meta._HYBRID_SUPPY_LIMIT_LOWER,
      Meta._HYBRID_SUPPY_LIMIT_UPPER,
      Meta._HYBRID_SUPPY_LIMIT_MAJOR,
    ];

    let funcs: ((est: Establishment) => boolean)[];
    if (G.expansion === Expansion.MK2) {
      // prettier-ignore
      funcs = [
        isLower,
        isUpper,
      ]
    } else {
      // prettier-ignore
      funcs = [
        (est) => isLower(est) && !isMajor(est),
        (est) => isUpper(est) && !isMajor(est),
        isMajor,
      ]
    }

    for (let i = 0; i < decks.length; i++) {
      while (decks[i].length > 0 && getAllAvailable(G).filter(funcs[i]).length < limits[i]) {
        const est = decks[i].pop()!;
        G._estData!.availableCount[est._id] += 1;
      }
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
  const { expansion, supplyVariant } = G;
  const ests = getAll(G);
  const numEsts = ests.length;

  // initialize data structure
  const data: EstablishmentData = {
    inUse: Array(numEsts).fill(false),
    remainingCount: Array(numEsts).fill(0),
    availableCount: Array(numEsts).fill(0),
    ownedCount: Array(numEsts)
      .fill(null)
      .map(() => Array(numPlayers).fill(0)),
  };

  // get establishments in use, starting establishments
  let ids: number[];
  let starting: number[];
  if (expansion === Expansion.Base) {
    ids = Meta._BASE_ESTABLISHMENTS;
    starting = Meta._STARTING_ESTABLISHMENTS;
  } else if (expansion === Expansion.Harbor) {
    ids = Meta._HARBOR_ESTABLISHMENTS;
    starting = Meta._STARTING_ESTABLISHMENTS;
  } else if (expansion === Expansion.MK2) {
    ids = Meta2._MK2_ESTABLISHMENTS;
    starting = Meta2._MK2_STARTING_ESTABLISHMENTS;
  } else {
    throw new Error(`Expansion '${expansion}' not implemented.`);
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
      decks[0].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
    }
  } else if (supplyVariant === SupplyVariant.Hybrid) {
    if (expansion === Expansion.MK2) {
      // put all cards into two decks: lower and upper
      decks = [[], []];
      for (const id of ids) {
        const est = ests[id];
        if (isLower(est)) {
          decks[0].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
        } else {
          decks[1].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
        }
      }
    } else {
      // put all cards into three decks: lower, upper, and major (purple)
      decks = [[], [], []];
      for (const id of ids) {
        const est = ests[id];
        if (isMajor(est)) {
          decks[2].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
        } else if (isLower(est)) {
          decks[0].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
        } else {
          decks[1].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
        }
      }
    }
  } else {
    throw new Error(`Supply variant '${supplyVariant}' not implemented.`);
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
