import { Est, Land, MachikoroG } from 'game';
import { assertUnreachable } from 'common/typescript';

import classNames from 'classnames';

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
      return assertUnreachable(color);
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
 * Parse an establishment's activation rolls into a printable format. (may be unused)
 * @param est
 * @returns
 */
export const rollsToString = (est: Est.Establishment): string => {
  return est.rolls.map((roll) => roll.toString()).join('; ');
};

/**
 * Parse an establishment's costs into a printable format.
 * @param G
 * @param land
 * @param player
 * @returns
 */
export const landCostsToString = (G: MachikoroG, land: Land.Landmark, player: number | null): string => {
  const landCostArray = Land.costArray(G, land, player);
  return '$' + landCostArray.map((cost) => cost.toString()).join('/');
};

/**
 * Parses the Material Symbols in a description by splitting the string and extracting the keywords.
 * @param description - string to be parsed
 */
export const parseMaterialSymbols = (description: string): Array<string | JSX.Element> => {
  const parsedDescription = [];
  const splitDescString = description.split('::');
  for (let i = 0; i < splitDescString.length; i++) {
    // If there is more than 1 string, every second string is a Material Symbol keyword.
    if (Math.abs(i % 2)) {
      parsedDescription.push(
        <span className={classNames('material-symbols-outlined', 'tooltip_sym')}>{splitDescString[i]}</span>
      );
    } else {
      parsedDescription.push(splitDescString[i]);
    }
  }
  return parsedDescription;
};

/**
 * Format the rolls associated with each establishment such that they are contained within its own box.
 * @param rolls - string to be parsed
 * @param subclass - keyword for CSS formatting
 */
export const formatRollBoxes = (rolls: number[], subclass: string): Array<string | JSX.Element> => {
  const formattedRollBox = [];
  const splitRollString = rolls.toString().split(',');
  for (let i = 0; i < splitRollString.length; i++) {
    if (i > 0) {
      formattedRollBox.push(' ');
    }
    formattedRollBox.push(<div className={subclass}>{splitRollString[i]}</div>);
  }
  return formattedRollBox;
};
