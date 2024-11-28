//
// Private utility functions for game logic.
//

import { Expansion, SetupData, SupplyVariant, Version } from './types';

/**
 * Validate setup data. Returns a string if invalid.
 * @param setupData
 * @param numPlayers
 * @returns
 */
export const validateSetupData = (setupData: SetupData | undefined, numPlayers: number): string | undefined => {
  if (setupData) {
    const { version, expansions, supplyVariant, initialBuyRounds, startCoins } = setupData;
    if (!Object.values(Version).includes(version)) {
      return `Unknown version: ${version.toString()}`;
    }
    for (const expansion of expansions) {
      if (!Object.values(Expansion).includes(expansion)) {
        return `Unknown expansion: ${expansion}`;
      }
    }
    if (!Object.values(SupplyVariant).includes(supplyVariant)) {
      return `Unknown supply variant: ${supplyVariant}`;
    }
    if (!Number.isInteger(startCoins) || startCoins < 0) {
      return `Number of starting coins, ${startCoins.toString()}, must be a non-negative integer`;
    }
    if (!Number.isInteger(initialBuyRounds) || initialBuyRounds < 0) {
      return `Number of initial buying rounds, ${initialBuyRounds.toString()}, must be a non-negative integer`;
    }
    // Base expansion must always be included
    if (!expansions.includes(Expansion.Base)) {
      return `Base expansion must be included`;
    }
    // If Machi Koro 2, cannot contain additional expansions
    if (version === Version.MK2 && expansions.length > 1) {
      return `Machi Koro 2 cannot contain additional expansions`;
    }
  }
  if (!(Number.isInteger(numPlayers) && numPlayers >= 2 && numPlayers <= 5)) {
    return `Number of players, ${numPlayers.toString()}, must be an integer between 2 to 5.`;
  }
  return;
};
