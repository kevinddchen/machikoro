//
// Utility functions for establishments.
//

import * as Meta from './metadata';
import { EstColor, EstType, Establishment, EstablishmentData } from './types';
import { Expansion, MachikoroG, SupplyVariant } from '../types';

export * from './metadata';
export * from './types';

/**
 * @param a
 * @param b
 * @returns True if the establishments are the same.
 */
export const isEqual = (a: Establishment, b: Establishment): boolean => {
  return a._id === b._id;
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
 * @param G
 * @returns List of all unique establishments that are in use for this game.
 * The establishments are returned in the intended display order.
 */
export const getAllInUse = (G: MachikoroG): Establishment[] => {
  return Meta.ESTABLISHMENTS.filter((est) => isInUse(G, est));
};

/**
 * @param G
 * @param player
 * @returns List of all unique establishments owned by the player. The
 * establishments are returned in the intended display order.
 */
export const getAllOwned = (G: MachikoroG, player: number): Establishment[] => {
  return Meta.ESTABLISHMENTS.filter((est) => countOwned(G, player, est) > 0);
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
  return Meta.ESTABLISHMENTS
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

  switch (supplyVariant) {
    case SupplyVariant.Total: {
      // put all establishments into the supply
      while (decks[0].length > 0) {
        const est = decks[0].pop()!;
        G._estData!.availableCount[est._id] += 1;
      }
      break;
    }
    case SupplyVariant.Variable: {
      // put establishments into the supply until there are 10 unique establishments
      while (decks[0].length > 0 && countUniqueAvailable(G) < Meta.VARIABLE_SUPPLY_LIMIT) {
        const est = decks[0].pop()!;
        G._estData!.availableCount[est._id] += 1;
      }
      break;
    }
    case SupplyVariant.Hybrid: {
      // put establishments into the supply until there are five unique
      // establishments with activation <= 6, five establishments with activation
      // > 7, and two purple establishments (this requires three decks).
      const limits = [Meta.HYBRID_SUPPY_LIMIT_LOWER, Meta.HYBRID_SUPPY_LIMIT_UPPER, Meta.HYBRID_SUPPY_LIMIT_PURPLE];
      const funcs = [countUniqueAvailableLower, countUniqueAvailableUpper, countUniqueAvailablePurple];
      for (let i = 0; i < 3; i++)
        while (decks[i].length > 0 && funcs[i](G) < limits[i]) {
          const est = decks[i].pop()!;
          G._estData!.availableCount[est._id] += 1;
        }
      break;
    }
    default:
      throw new Error(`Supply variant '${supplyVariant}' not implemented.`);
  }
};

/**
 * Initialize the landmark data for a game by modifying `G`.
 * @param G
 */
export const initialize = (G: MachikoroG, numPlayers: number): void => {
  const { expansion, supplyVariant } = G;
  const numEsts = Meta.ESTABLISHMENTS.length;

  const data: EstablishmentData = {
    inUse: Array(numEsts).fill(false),
    remainingCount: Array(numEsts).fill(0),
    availableCount: Array(numEsts).fill(0),
    ownedCount: Array(numEsts)
      .fill(null)
      .map(() => Array(numPlayers).fill(0)),
  };

  // initialize establishments in use
  let ids: number[];
  switch (expansion) {
    case Expansion.Base: {
      ids = Meta._BASE_ESTABLISHMENT_IDS;
      break;
    }
    case Expansion.Harbor: {
      ids = Meta._HARBOR_ESTABLISHMENT_IDS;
      break;
    }
    default:
      throw new Error(`Expansion '${expansion}' not implemented.`);
  }

  for (const id of ids) {
    const est = Meta._ESTABLISHMENTS_BY_ID[id];
    data.inUse[id] = true;
    // all establishments have 6 copies except for purple establishments,
    // which have the same number of copies as the number of players.
    data.remainingCount[id] = est.color === EstColor.Purple ? numPlayers : 6;
  }

  // give each player their starting establishments
  for (const id of Meta._STARTING_ESTABLISHMENT_IDS) {
    for (const player of Array(numPlayers).keys()) {
      data.ownedCount[id][player] += 1;
    }
  }

  // prepare decks
  let decks: Establishment[][];
  switch (supplyVariant) {
    case SupplyVariant.Total:
    case SupplyVariant.Variable: {
      // put all cards into one deck
      decks = [[]];
      for (const id of ids) {
        const est = Meta._ESTABLISHMENTS_BY_ID[id];
        decks[0].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
      }
      break;
    }
    case SupplyVariant.Hybrid: {
      // put all cards into three decks: lower, upper, and purple
      decks = [[], [], []];
      for (const id of ids) {
        const est = Meta._ESTABLISHMENTS_BY_ID[id];
        if (isLower(est)) {
          decks[0].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
        } else if (isUpper(est)) {
          decks[1].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
        } else {
          decks[2].push(...Array<Establishment>(data.remainingCount[id]).fill(est));
        }
      }
      break;
    }
    default:
      throw new Error(`Supply variant '${supplyVariant}' not implemented.`);
  }

  // update G
  G._estData = data;
  G.secret._decks = decks;
};

/**
 * @param est
 * @returns True if the establishment is "Lower" for Hybrid Supply, i.e.
 * activates on rolls <= 6 and is not Purple.
 */
export const isLower = (est: Establishment): boolean => {
  return est.rolls[0] <= 6 && est.color !== EstColor.Purple;
};

/**
 * @param est
 * @returns True if the establishment is "Upper" for Hybrid Supply, i.e.
 * activates on rolls > 6 and is not Purple.
 */
export const isUpper = (est: Establishment): boolean => {
  return est.rolls[0] > 6 && est.color !== EstColor.Purple;
};

/**
 * @param G
 * @returns The number of unique establishments that are available for purchase
 * from the supply.
 */
export const countUniqueAvailable = (G: MachikoroG): number => {
  return Meta.ESTABLISHMENTS.filter((est) => countAvailable(G, est) > 0).length;
};

/**
 * @param G
 * @returns The number of unique establishments that are available for purchase
 * from the supply and are "Lower" for Hybrid Supply.
 */
export const countUniqueAvailableLower = (G: MachikoroG): number => {
  // prettier-ignore
  return Meta.ESTABLISHMENTS
    .filter((est) => isLower(est) && countAvailable(G, est) > 0)
    .length;
};

/**
 * @param G
 * @returns The number of unique establishments that are available for purchase
 * from the supply and are "Upper" for Hybrid Supply.
 */
export const countUniqueAvailableUpper = (G: MachikoroG): number => {
  // prettier-ignore
  return Meta.ESTABLISHMENTS
    .filter((est) => isUpper(est) && countAvailable(G, est) > 0)
    .length;
};

/**
 * @param data
 * @returns The number of unique establishments that are available for purchase
 * from the supply and are Purple.
 */
export const countUniqueAvailablePurple = (G: MachikoroG): number => {
  // prettier-ignore
  return Meta.ESTABLISHMENTS
    .filter((est) => (est.color === EstColor.Purple) && countAvailable(G, est) > 0)
    .length;
};
