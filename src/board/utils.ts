import { Est } from 'game';

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
 * @param owned
 * @param canBuy
 * @returns
 */
export const landColorToClass = (owned: boolean, canBuy: boolean): string => {
  if (owned) {
    return 'land_img_owned';
  } else if (canBuy) {
    return 'land_img_can_buy';
  } else {
    return 'land_img_unowned';
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
