import { Est, Land } from 'game';

/**
 * Convert `Est.EstColor` to CSS class name.
 * @param color
 * @param darker - If true, uses darker variant.
 * @returns
 */
export const estColorToClass = (color: Est.EstColor, darker: boolean): string => {
  switch (color) {
    case Est.EstColor.Blue:
      return darker ? 'est_img_pri' : 'est_img_pri_light';
    case Est.EstColor.Green:
      return darker ? 'est_img_sec' : 'est_img_sec_light';
    case Est.EstColor.Red:
      return darker ? 'est_img_res' : 'est_img_res_light';
    case Est.EstColor.Purple:
      return darker ? 'est_img_maj' : 'est_img_maj_light';
    default:
      throw new Error(`Invalid establishment color: ${color}`);
  }
};

/**
 * Return CSS class name for displaying a landmark.
 * @param canBuy - If true, uses darker color.
 * @returns
 */
export const landColorToClass = (canBuy: boolean): string => {
  if (canBuy) {
    return 'land_img';
  } else {
    return 'land_img_light';
  }
};

/**
 * Parse an establishment's activation rolls into a printable format.
 * @param est
 * @returns
 */
export const rollsToString = (est: Est.Establishment): string => {
  return est.rolls.map((roll) => roll.toString()).join('; ');
};

/**
 * Parse an establishment's costs into a printable format.
 * @param land 
 */
export const landCostsToString = (land: Land.Landmark): string => {
  // HACK: accessing private variable
  return '$' + land._cost.map((cost) => cost.toString()).join('/');
};
