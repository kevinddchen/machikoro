import { Server } from 'boardgame.io';

import { Expansion, SupplyVariant } from 'game';

/**
 * Function to assert type is not null to avoid using the non-null assertion operator "!".
 */
export function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error(`Fatal error: value ${String(value)} must not be null/undefined.`);
  }
}

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

/**
 * @param expansion
 * @returns Display name for expansion.
 */
export function expansionName(expansion: Expansion | null): string {
  switch (expansion) {
    case Expansion.Base:
      return 'Base Game';
    case Expansion.Harbor:
      return 'Harbor Expansion';
    case Expansion.MK2:
      return 'Machi Koro 2';
    default:
      return '??? Expansion';
  }
}

/**
 * @param supplyVariant
 * @returns Display name for supply variant.
 */
export function supplyVariantName(supplyVariant: SupplyVariant | null): string {
  switch (supplyVariant) {
    case SupplyVariant.Hybrid:
      return 'Hybrid Supply';
    case SupplyVariant.Variable:
      return 'Variable Supply';
    case SupplyVariant.Total:
      return 'Total Supply';
    default:
      return '??? Supply Variant';
  }
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
  return (obj as IDetails)?.details !== undefined && typeof (obj as IDetails).details === 'string';
};
