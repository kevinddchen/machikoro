import { Server } from 'boardgame.io';

import { Expansion, SupplyVariant } from 'game';

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
export function expansionName(expansion?: Expansion): string {
  switch (expansion) {
    case Expansion.Base:
      return 'Base Game';
    case Expansion.Harbor:
      return 'Harbor Expansion';
    default:
      return '??? Expansion';
  }
}

/**
 * @param supplyVariant 
 * @returns Display name for supply variant.
 */
export function supplyVariantName(supplyVariant?: SupplyVariant): string {
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
