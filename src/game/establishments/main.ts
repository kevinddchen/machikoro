//
// Utility functions for establishments.
//

import { assertNonNull, assertUnreachable } from 'common/typescript';

import * as Meta from './metadata';
import * as Meta2 from './metadata2';
import { EstColor, EstType, Establishment, EstablishmentData } from './types';
import { Expansion, MachikoroG, SupplyVariant, Version } from '../types';

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
  return a._id === b._id && a.version === b.version;
};

/**
 * @param est
 * @param version
 * @param expansions
 * @returns True if the establishment is in use for this game.
 */
export const isInUse = (est: Establishment, version: Version, expansions: Expansion[]): boolean => {
  return version === est.version && expansions.includes(est.expansion);
};

/**
 * @param G
 * @param est
 * @returns The number of establishments of this kind that are still available
 * in the supply and deck.
 */
export const countRemaining = (G: MachikoroG, est: Establishment): number => {
  if (G.version !== est.version) {
    return 0;
  }
  return G.estData._remainingCount[est._id];
};

/**
 * @param G
 * @param est
 * @returns The number of establishments of this kind that are available for
 * purchase from the supply.
 */
export const countAvailable = (G: MachikoroG, est: Establishment): number => {
  if (G.version !== est.version) {
    return 0;
  }
  return G.estData._availableCount[est._id];
};

/**
 * @param G
 * @param player
 * @param est
 * @returns The number of establishments of this kind that are owned by the
 * player.
 */
export const countOwned = (G: MachikoroG, player: number, est: Establishment): number => {
  if (G.version !== est.version) {
    return 0;
  }
  return G.estData._ownedCount[player][est._id];
};

/**
 * Get all establishments for Machi Koro 1 or 2.
 * @param version
 * @returns
 */
const getAll = (version: Version): Establishment[] => {
  if (version === Version.MK1) {
    return Meta._ESTABLISHMENTS;
  } else if (version === Version.MK2) {
    return Meta2._ESTABLISHMENTS2;
  } else {
    return assertUnreachable(version);
  }
};

/**
 * @param version
 * @param expansions
 * @returns List of all unique establishments that are in use for this game.
 * The establishments are returned in the intended display order.
 */
export const getAllInUse = (version: Version, expansions: Expansion[]): Establishment[] => {
  return getAll(version).filter((est) => isInUse(est, version, expansions));
};

/**
 * @param G
 * @returns List of all unique establishments that are available for purchase
 * from the supply.
 */
export const getAllAvailable = (G: MachikoroG): Establishment[] => {
  return getAll(G.version).filter((est) => countAvailable(G, est) > 0);
};

/**
 * @param G
 * @param player
 * @returns List of all unique establishments owned by the player. The
 * establishments are returned in the intended display order.
 */
export const getAllOwned = (G: MachikoroG, player: number): Establishment[] => {
  return getAll(G.version).filter((est) => countOwned(G, player, est) > 0);
};

/**
 * @param G
 * @param player
 * @param type
 * @returns The number of establishments that are owned by the player and have
 * the specified type.
 */
export const countTypeOwned = (G: MachikoroG, player: number, type: EstType): number => {
  return getAll(G.version)
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
  if (G.version !== est.version) {
    throw new Error(`Establishment ${est.name} does not match the game version, ${G.version}.`);
  }
  G.estData._remainingCount[est._id] -= 1;
  G.estData._availableCount[est._id] -= 1;
  G.estData._ownedCount[player][est._id] += 1;
};

/**
 * Update `G` to reflect an establishment transferring ownership.
 * @param G
 * @param args.from - Source player.
 * @param args.to - Destination player.
 * @param est - Establishment in question.
 */
export const transfer = (G: MachikoroG, args: { from: number; to: number }, est: Establishment): void => {
  if (G.version !== est.version) {
    throw new Error(`Establishment ${est.name} does not match the game version, ${G.version}.`);
  }
  G.estData._ownedCount[args.from][est._id] -= 1;
  G.estData._ownedCount[args.to][est._id] += 1;
};

/**
 * @param G
 * @param player
 * @param est
 * @returns The number of establishments of this kind that are owned by the
 * player and are under renovations.
 */
export const countRenovation = (G: MachikoroG, player: number, est: Establishment): number => {
  if (G.version !== est.version) {
    return 0;
  }
  return G.estData._renovationCount[player][est._id];
};

/**
 * Update `G` to reflect the number of establishments of this kind that are
 * owned by the player and are under renovations.
 * @param G 
 * @param player 
 * @param est 
 * @param count 
 */
export const setRenovationCount = (G: MachikoroG, player: number, est: Establishment, count: number): void => {
  if (G.version !== est.version) {
    throw new Error(`Establishment ${est.name} does not match the game version, ${G.version}.`);
  }
  G.estData._renovationCount[player][est._id] = count;
};

/**
 * Replenish the supply.
 * @param G
 */
export const replenishSupply = (G: MachikoroG): void => {
  const { version, supplyVariant } = G;
  const decks = G.secret.estDecks;

  if (supplyVariant === SupplyVariant.Total) {
    // put all establishments into the supply
    while (decks[0].length > 0) {
      const est = decks[0].pop();
      assertNonNull(est);
      G.estData._availableCount[est._id] += 1;
    }
  } else if (supplyVariant === SupplyVariant.Variable) {
    // put establishments into the supply until there are ten unique establishments
    while (decks[0].length > 0 && getAllAvailable(G).length < _VARIABLE_SUPPLY_LIMIT) {
      const est = decks[0].pop();
      assertNonNull(est);
      G.estData._availableCount[est._id] += 1;
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
        G.estData._availableCount[est._id] += 1;
      }
    }
  } else {
    return assertUnreachable(supplyVariant);
  }
};

/**
 * Output of establishment initialization.
 * @prop {EstablishmentData} estData - The establishment data.
 * @prop {Establishment[][]} estDecks - The establishment deck(s).
 */
interface EstInitializeOutput {
  estData: EstablishmentData;
  estDecks: Establishment[][];
}

/**
 * Initialize the establishment data for a game.
 * @param version
 * @param expansions
 * @param supplyVariant
 * @param numPlayers
 */
export const initialize = (
  version: Version,
  expansions: Expansion[],
  supplyVariant: SupplyVariant,
  numPlayers: number,
): EstInitializeOutput => {
  const numEsts = getAll(version).length;

  // initialize data structure
  const estData: EstablishmentData = {
    _remainingCount: Array.from({ length: numEsts }, () => 0),
    _availableCount: Array.from({ length: numEsts }, () => 0),
    _ownedCount: Array.from({ length: numPlayers }, () => Array.from({ length: numEsts }, () => 0)),
    _renovationCount: Array.from({ length: numPlayers }, () => Array.from({ length: numEsts }, () => 0)),
  };

  // populate establishments in use
  const inUse = getAllInUse(version, expansions);
  for (const est of inUse) {
    // if `est._initial` is null, use the number of players
    estData._remainingCount[est._id] = est._initial ?? numPlayers;
  }

  // give each player their starting establishments
  let starting: number[];
  if (version === Version.MK1) {
    starting = Meta._STARTING_ESTABLISHMENTS;
  } else if (version === Version.MK2) {
    starting = Meta2._MK2_STARTING_ESTABLISHMENTS;
  } else {
    return assertUnreachable(version);
  }
  for (const id of starting) {
    for (const player of Array(numPlayers).keys()) {
      estData._ownedCount[player][id] += 1;
    }
  }

  // prepare decks
  let estDecks: Establishment[][];
  if (supplyVariant === SupplyVariant.Total || supplyVariant === SupplyVariant.Variable) {
    // put all cards into one deck
    estDecks = [[]];
    for (const est of inUse) {
      estDecks[0].push(...Array.from({ length: estData._remainingCount[est._id] }, () => est));
    }
  } else if (supplyVariant === SupplyVariant.Hybrid) {
    if (version === Version.MK1) {
      // put all cards into three decks: lower, upper, and major (purple)
      estDecks = [[], [], []];
      for (const est of inUse) {
        if (isMajor(est)) {
          estDecks[2].push(...Array.from({ length: estData._remainingCount[est._id] }, () => est));
        } else if (isLower(est)) {
          estDecks[0].push(...Array.from({ length: estData._remainingCount[est._id] }, () => est));
        } else {
          estDecks[1].push(...Array.from({ length: estData._remainingCount[est._id] }, () => est));
        }
      }
    } else if (version === Version.MK2) {
      // put all cards into two decks: lower and upper
      estDecks = [[], []];
      for (const est of inUse) {
        if (isLower(est)) {
          estDecks[0].push(...Array.from({ length: estData._remainingCount[est._id] }, () => est));
        } else {
          estDecks[1].push(...Array.from({ length: estData._remainingCount[est._id] }, () => est));
        }
      }
    } else {
      return assertUnreachable(version);
    }
  } else {
    return assertUnreachable(supplyVariant);
  }

  return { estData, estDecks };
};

/**
 * @param est
 * @returns True if the establishment activates on rolls <= 6.
 */
export const isLower = (est: Establishment): boolean => {
  return est.rolls[0] <= 6;
};

/**
 * @param est
 * @returns True if the establishment activates on rolls > 6.
 */
export const isUpper = (est: Establishment): boolean => {
  return est.rolls[0] > 6;
};

/**
 * @param est
 * @returns True if the establishment is major (purple).
 */
export const isMajor = (est: Establishment): boolean => {
  return est.color === EstColor.Purple;
};
