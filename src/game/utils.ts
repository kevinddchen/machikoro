//
// Enums related to game configuration.
//

import { assertUnreachable } from 'common';

import { Expansion, SetupData, SupplyVariant, Version } from './types';

/**
 * Convert the expansion to the game version. "Base" and "Harbor" are both
 * version 1, while "MK2" is version 2.
 * @param exp
 * @returns
 */
export const expToVer = (exp: Expansion): Version => {
  if (exp === Expansion.Base || exp === Expansion.Harbor) {
    return Version.MK1;
  } else if (exp === Expansion.MK2) {
    return Version.MK2;
  } else {
    return assertUnreachable(exp);
  }
};

/**
 * Validate setup data. Returns a string if invalid.
 * @param setupData
 * @param numPlayers
 * @returns
 */
export const validateSetupData = (setupData: SetupData | undefined, numPlayers: number): string | undefined => {
  if (setupData) {
    const { expansion, supplyVariant, initialBuyRounds, startCoins } = setupData;
    if (!Object.values(Expansion).includes(expansion)) {
      return `Unknown expansion: ${expansion}`;
    }
    if (!Object.values(SupplyVariant).includes(supplyVariant)) {
      return `Unknown supply variant: ${supplyVariant}`;
    }
    if (!Number.isInteger(startCoins) || startCoins < 0) {
      return `Number of starting coins, ${startCoins}, must be a non-negative integer`;
    }
    if (!Number.isInteger(initialBuyRounds) || initialBuyRounds < 0) {
      return `Number of initial buying rounds, ${initialBuyRounds}, must be a non-negative integer`;
    }
  }
  if (!(Number.isInteger(numPlayers) && numPlayers >= 2 && numPlayers <= 5)) {
    return `Number of players, ${numPlayers}, must be an integer between 2 to 5.`;
  }
  return;
};
