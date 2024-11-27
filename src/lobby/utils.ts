import { Server } from 'boardgame.io';
import has from 'lodash/has';

/**
 * Currently, the most reliable way to check if a seat is occupied is to check
 * if the `PlayerMetadata` object contains the field 'name'. If yes, then it is
 * occupied.
 * @param player - `PlayerMetadata` object to check.
 * @returns True if the seat is occupied.
 */
export function seatIsOccupied(player: Server.PlayerMetadata): boolean {
  return 'name' in player;
}

/**
 * Count the number of occupied seats.
 * @param players - List of `PlayerMetadata` objects.
 * @returns Number of occupied seats.
 */
export function countPlayers(players: Server.PlayerMetadata[]): number {
  return players.filter(seatIsOccupied).length;
}

export interface IDetails {
  details: string;
}

/**
 * Returns true if the object has a `details` field that is a string.
 * @param obj
 * @returns
 */
export const hasDetails = (obj: unknown): obj is IDetails => {
  return has(obj, 'details') && typeof obj.details === 'string';
};
