import type { Server } from 'boardgame.io';

// This file contains some useful functions which are used in multiple places.

/**
 * Currently, the most reliable way to check if a seat is occupied is to check 
 * if the `PlayerMetadata` object contains the field 'name'. If yes, then it is
 * occupied. 
 * @param player - `PlayerMetadata` object to check. 
 * @returns True if the seat is occupied.
 */
export function seatIsOccupied(player: Server.PlayerMetadata): boolean {
  return ('name' in player);
}

/**
 * Count the number of occupied seats.
 * @param players - List of `PlayerMetadata` objects.
 * @returns Number of occupied seats.
 */
export function countPlayers (players: Server.PlayerMetadata[]): number {
  let count = 0;
  for (let player of players)
    if (seatIsOccupied(player))
      count++;
  return count;
}

/* Name generating fuctions */

export function expansionName (expr: string): string {
  switch (expr) {
    case 'base':
      return 'Base Game';
    case 'harbor':
      return 'Harbor Expansion';
    default:
      return '??? Expansion';
  }
}

export function supplyVariantName (expr: string): string {
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
