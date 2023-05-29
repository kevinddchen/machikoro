import Koa from 'koa';

import { MAX_PLAYER_NAME_LENGTH } from 'common/config';

/**
 * Remove whitespace and normalize unicode characters, for more reliable
 * string equality checks.
 * @param name
 * @returns
 */
export const sanitizePlayerName = (name: string): string => {
  name = name.trim(); // remove whitespace
  name = name.normalize(); // normalize unicode characters
  return name;
};

/**
 * Check that a player's name is not empty and is not too long.
 * @param ctx
 * @param name
 */
export const validatePlayerName = (ctx: Koa.Context, name: string): void => {
  if (name.length === 0) {
    ctx.throw(403, 'Player name cannot be empty.');
  } else if ([...name].length > MAX_PLAYER_NAME_LENGTH) {
    ctx.throw(403, 'Player name too long.');
  }
};
