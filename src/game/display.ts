//
// Useful functions for displaying game-related text
//

import { assertUnreachable } from 'common/typescript';

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
  if (version === Version.MK1) {
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
  } else if (version === Version.MK2) {
    return 'Machi Koro 2';
  } else {
    return assertUnreachable(version);
  }
}

/**
 * @param version
 * @returns Display name for version.
 */
export function versionName(version: Version | null): string {
  if (version === null) {
    return '???';
  } else if (version === Version.MK1) {
    return 'Machi Koro';
  } else if (version === Version.MK2) {
    return 'Machi Koro 2';
  } else {
    return assertUnreachable(version);
  }
}

/**
 * @param expansion
 * @returns Display name for expansion.
 */
export function expansionName(expansion: Expansion | null): string {
  if (expansion === null) {
    return '???';
  } else if (expansion === Expansion.Base) {
    return 'Base Game';
  } else if (expansion === Expansion.Harbor) {
    return 'Harbor Expansion';
  } else if (expansion === Expansion.Million) {
    return "Millionaire's Row Expansion";
  } else {
    return assertUnreachable(expansion);
  }
}

/**
 * @param supplyVariant
 * @returns Display name for supply variant.
 */
export function supplyVariantName(supplyVariant: SupplyVariant | null): string {
  if (supplyVariant === null) {
    return '???';
  } else if (supplyVariant === SupplyVariant.Hybrid) {
    return 'Hybrid Supply';
  } else if (supplyVariant === SupplyVariant.Variable) {
    return 'Variable Supply';
  } else if (supplyVariant === SupplyVariant.Total) {
    return 'Total Supply';
  } else {
    return assertUnreachable(supplyVariant);
  }
}
