//
// Useful functions for displaying game-related text
//

import { Expansion, SupplyVariant, Version } from './types';

/**
 * @param version
 * @param expansions
 * @returns Display name for version and expansion combination.
 */
export function displayName(version: Version | null, expansions: Expansion[] | null): string {
  if (version === null || expansions === null) {
    return '???';
  }
  switch (version) {
    case Version.MK1: {
      const harbor = expansions.includes(Expansion.Harbor);
      const million = expansions.includes(Expansion.Million);
      if (harbor && million) {
        return "Harbor + Millionaire's Row Expansions";
      } else if (harbor) {
        return 'Harbor Expansion';
      } else if (million) {
        return "Millionaire's Row Expansion";
      } else {
        return 'Base Game';
      }
    }
    case Version.MK2:
      return 'Machi Koro 2';
  }
}

/**
 * @param version
 * @returns Display name for version.
 */
export function versionName(version: Version | null): string {
  switch (version) {
    case Version.MK1:
      return 'Machi Koro';
    case Version.MK2:
      return 'Machi Koro 2';
    default:
      return '???'
  }
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
    case Expansion.Million:
      return "Millionaire's Row Expansion";
    default:
      return '???';
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
      return '???';
  }
}

/**
 * @param amount
 * @returns 'coin' if amount is 1, 'coins' otherwise.
 */
export const coinPlural = (amount: number): string => {
  return amount === 1 ? 'coin' : 'coins';
};
