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
