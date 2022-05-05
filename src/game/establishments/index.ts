import * as metadata from './metadata';
import { Color, CardType, Expansion, SupplyVariant } from '../enums';
import { MachikoroG, Establishment, EstablishmentData } from '../types';

export * from './metadata';

/*

Abstraction for establishments.

*/

const VARIABLE_SUPPLY_LIMIT = 10;
const HYBRID_SUPPY_LIMIT_LOWER = 5;
const HYBRID_SUPPY_LIMIT_UPPER = 5;
const HYBRID_SUPPY_LIMIT_PURPLE = 2;

/**
 * @param a
 * @param b
 * @returns True if the establishments are the same.
 */
export const isEqual = (a: Establishment, b: Establishment): boolean => {
  return a._id === b._id;
};

/**
 * @param data
 * @param est Establishment.
 * @returns True if the establishment is in use for this game.
 */
export const isInUse = (data: EstablishmentData, est: Establishment): boolean => {
  return data._in_use[est._id];
};

/**
 * @param data
 * @param est Establishment. 
 * @returns Number of establishments of this kind that are still available in
 *  the supply and deck.
 */
export const countRemaining = (data: EstablishmentData, est: Establishment): number => {
  return data._remaining_count[est._id];
};

/**
 * @param data
 * @param est Establishment. 
 * @returns Number of establishments of this kind that are available for
 *  purchase from the supply.
 */
export const countAvailable = (data: EstablishmentData, est: Establishment): number => {
  return data._available_count[est._id];
};

/**
 * @param data
 * @param player Player ID. 
 * @param est Establishment.
 * @returns Number of establishments of this kind that are owned by this player.
 */
export const countOwned = (data: EstablishmentData, player: number, est: Establishment): number => {
  return data._owned_count[player][est._id];
};

/**
 * @param data
 * @returns All establishments that are in use for this game. 
 */
export const getAllInUse = (data: EstablishmentData): Establishment[] => {
  const all: Establishment[] = [];
  for (const est of metadata.all_establishments)
    if (isInUse(data, est))
      all.push(est);
  return all;
};

/**
 * Obtain a list of all unique establishments that the player owns.
 * @param data
 * @param player Player ID. 
 * @returns List of unique establishments.
 */
export const getAllOwned = (data: EstablishmentData, player: number): Establishment[] => {
  const all: Establishment[] = [];
  for (const est of metadata.all_establishments)
    if (countOwned(data, player, est) > 0)
      all.push(est);
  return all;
};

/**
 * Count the number of establishments of a particular type the player owns.
 * Duplicates are counted towards this total.
 * @param data
 * @param player Player ID.
 * @param type Card type.
 * @returns Total count.
 */
export const countTypeOwned = (data: EstablishmentData, player: number, type: CardType): number => {
  let count = 0;
  for (const est of metadata.all_establishments)
    if (est.type === type)
      count += countOwned(data, player, est);
  return count;
};

/**
 * Update `EstablishmentData` for a player buying an establishment.
 * @param data
 * @param player Player ID.
 * @param est Establishment.
 */
export const buy = (data: EstablishmentData, player: number, est: Establishment): void => {
  data._remaining_count[est._id]--;
  data._available_count[est._id]--;
  data._owned_count[player][est._id]++;
};

/**
 * Update `EstablishmentData` for an establishment transferring ownership.
 * @param data
 * @param obj `from` gives `est` to `to`.
 */
export const transfer = (data: EstablishmentData, obj: {from: number, to: number, est: Establishment}): void => {
  data._owned_count[obj.from][obj.est._id]--;
  data._owned_count[obj.to][obj.est._id]++;
};

// Supply replenishment and initialization ------------------------------------

/**
 * Replenish the supply given a particular supply variant.
 * @param G
 */
export const replenishSupply = (G: MachikoroG): void => {
  const { est_data, supplyVariant } = G;
  const { decks } = G.secret;

  switch (supplyVariant) {
    case SupplyVariant.Total:

      // put all establishments into the supply
      while (decks[0].length > 0) {
        const est = decks[0].pop();
        est_data._available_count[est!._id]++;
      }
      break;

    case SupplyVariant.Variable:

      // put establishments into the supply until there are 10 unique establishments
      while (decks[0].length > 0 && est_data._available_count.filter(count => count > 0).length < VARIABLE_SUPPLY_LIMIT) {
        const est = decks[0].pop();
        est_data._available_count[est!._id]++;
      }
      break;

    case SupplyVariant.Hybrid:

      // put establishments into the supply until there are five unique 
      // establishments with activation <= 6, five establishments with activation 
      // >= 7, and 2 purple establishments (this requires three decks).
      const limits = [HYBRID_SUPPY_LIMIT_LOWER, HYBRID_SUPPY_LIMIT_UPPER, HYBRID_SUPPY_LIMIT_PURPLE];
      const funcs = [countUniqueLower, countUniqueUpper, countUniquePurple];
      for (let i = 0; i < 3; i++)
        while (decks[i].length > 0 && funcs[i](est_data) < limits[i]) {
          const est = decks[i].pop();
          est_data._available_count[est!._id]++;
        }
      break;

    default:
      throw new Error(`Unknown supply variant: ${supplyVariant}`);
  }
};

/**
 * Initialize the establishment data for a game.
 * @param expansion Expansion.
 * @param variant Supply variant.
 * @param numPlayers Number of players.
 * @returns The `EstablishmentData` for the game, which is an object that is
 *  passed between the client and server, and the unshuffled establishment 
 *  decks, which is hidden from the client.
 */
export const initialize = (expansion: Expansion, variant: SupplyVariant, numPlayers: number): 
  { data: EstablishmentData, decks: Establishment[][] } => {

  // declare empty data structure
  const total_count = metadata.all_establishments.length;
  let data: EstablishmentData = {
    _in_use: Array(total_count).fill(false),
    _remaining_count: Array(total_count).fill(0),
    _available_count: Array(total_count).fill(0),
    _owned_count: Array(numPlayers).fill(Array(total_count).fill(0)), 
  };

  // get establishments in use
  let in_use_ids: number[];
  switch (expansion) {

    case Expansion.Base:
      in_use_ids = metadata._base_establishment_ids;
      break;

    case Expansion.Harbor:
      in_use_ids = metadata._harbor_establishment_ids;
      break;

    default:
      throw new Error(`Unknown expansion: ${expansion}`);
  }

  // populate `EstablishmentData`
  for (const id of in_use_ids) {
    const est = metadata.all_establishments[id];
    data._in_use[id] = true;
    // all establishments have 6 copies except for purple establishments,
    // which have the same number of copies as the number of players.
    data._remaining_count[id] = est.color === Color.Purple ? numPlayers : 6;
  }

  // prepare decks
  let decks: Establishment[][];
  switch (variant) {

    case (SupplyVariant.Total):
    case (SupplyVariant.Variable):
      // put all cards into one deck
      decks = [[]];
      for (const id of in_use_ids) {
        const est = metadata.all_establishments[id];
        decks[0].push(...Array<Establishment>(data._remaining_count[id]).fill(est));
      }
      break;
  
    case (SupplyVariant.Hybrid):
      // put all cards into three decks: activation <= 6, activation >= 7, and purple.
      decks = [[], [], []];
      for (const id of in_use_ids) {
        const est = metadata.all_establishments[id];
        if (isLower(est))
          decks[0].push(est);
        else if (isUpper(est))
          decks[1].push(est);
        else
          decks[2].push(est);
      }
      break;

    default:
      throw new Error(`Unknown supply variant: ${variant}`);
  }
  return { data, decks };
};

// Helper ---------------------------------------------------------------------

// Note: all establishments have activations in the range 1-6 or 7+, never both.

const isLower = (est: Establishment): boolean => {
  return est.activation[0] <= 6 && est.color !== Color.Purple;
};

const isUpper = (est: Establishment): boolean => {
  return est.activation[0] > 6 && est.color !== Color.Purple;
};

/**
 * @param data
 * @returns Number of unique establishments that are available in the supply 
 *  with activation numbers 6 or under.
 */
const countUniqueLower = (data: EstablishmentData): number => {
  return (
    metadata.all_establishments.filter(est => 
      isLower(est) && isInUse(data, est) && countAvailable(data, est) > 0
    ).length
  );
};

/**
 * @param data 
 * @returns Number of unique establishments that are available in the supply 
 *  with activation numbers 7 or above.
 */
const countUniqueUpper = (data: EstablishmentData): number => {
  return (
    metadata.all_establishments.filter(est =>
      isUpper(est) && isInUse(data, est) && countAvailable(data, est) > 0
    ).length
  );
};

/**
 * @param data 
 * @returns Number of unique purple establishments that are available in the supply.
 */
const countUniquePurple = (data: EstablishmentData): number => {
  return (
    metadata.all_establishments.filter(est =>
      est.color === Color.Purple && isInUse(data, est) && countAvailable(data, est) > 0
    ).length
  );
};
