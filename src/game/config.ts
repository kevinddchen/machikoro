/**
 * Expansion enum.
 */
export const Expansion = {
  Base: 'Base',
  Harbor: 'Harbor',
  MK2: 'MK2',
} as const;

export type Expansion = (typeof Expansion)[keyof typeof Expansion];

/**
 * Supply variant enum.
 */
export const SupplyVariant = {
  Total: 'Total',
  Variable: 'Variable',
  Hybrid: 'Hybrid',
} as const;

export type SupplyVariant = (typeof SupplyVariant)[keyof typeof SupplyVariant];

/**
 * Version enum, for Machi Koro 1 or 2.
 */
export const Version = {
  MK1: 1,
  MK2: 2,
} as const;

export type Version = (typeof Version)[keyof typeof Version];

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
    throw new Error(`Expansion '${exp}' not implemented.`);
  }
};
