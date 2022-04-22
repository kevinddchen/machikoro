// This file contains some useful functions which are used in multiple places.

/**
 * Count the number of active players.
 * @param {Array} players An array of `player` objects.
 * @returns {number}
 */
export function countPlayers(players) {
  let count = 0;
  players.forEach( (x) => {if ("name" in x) count++} );
  return count;
}

/* Name generating fuctions */

export function expansion_name(expr) {
  switch (expr) {
    case 'base':
      return 'Base Game';
    case 'harbor':
      return 'Harbor Expansion';
    default:
      return '??? Expansion';
  }
}

export function supplyVariant_name(expr) {
  switch (expr) {
    case 'hybrid':
      return 'Hybrid Supply';
    case 'variable':
      return 'Variable Supply';
    case 'total':
      return 'Total Supply';
    default:
      return '??? Supply Variant';
  }
}
