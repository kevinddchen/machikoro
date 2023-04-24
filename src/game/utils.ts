//
// Enums related to game configuration.
//

import { assertUnreachable } from 'common';

import { Expansion, Version } from './types';

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
