import { Server as ServerTypes, StorageAPI } from 'boardgame.io/dist/types/src/types';
import Koa from 'koa';
import Router from '@koa/router';

import { createMatchBody, joinMatchBody } from 'lobby/Lobby';
import { MAX_PLAYER_NAME_LENGTH } from 'common/config';

/**
 * This function returns middleware that reads the request body, runs a
 * callback on it to modify it, and then rewrites the request body with the
 * modified version. This is so that `boardgame.io` can parse the modified
 * request body afterwards.
 *
 * See https://github.com/boardgameio/boardgame.io/issues/1143 for more info
 * on why this is done this way and we do not use `koaBody()`.
 * @param callback - Takes the request body and returns the modified version.
 * @returns A middleware function, to be used in a Koa router.
 */
const patchRequest = (callback: (ctx: Koa.Context, body: object) => Promise<object>) => {
  return async (ctx: Koa.Context, next: () => Promise<void>) => {

    console.dir(ctx.req);
  
    // Read the request body.
    const chunks = [];
    let chunk;
    while (null !== (chunk = ctx.req.read() as Uint8Array)) {
      chunks.push(chunk);
    }

    console.log(chunks);

    const rawBody = Buffer.concat(chunks).toString('utf8');
    const body = JSON.parse(rawBody) as object;

    const newBody = await callback(ctx, body);
    const rawNewBody = Buffer.from(JSON.stringify(newBody), 'utf8');

    // Rewrite the request body.
    ctx.req.unshift(rawNewBody);
    ctx.req.headers['content-length'] = rawNewBody.length.toString();
    await next();
  };
};

/**
 * Remove whitespace and normalize unicode characters, for more reliable
 * string equality checks.
 * @param name
 * @returns
 */
const sanitizePlayerName = (name: string): string => {
  name = name.trim(); // remove whitespace
  name = name.normalize(); // normalize unicode characters
  return name;
};

/**
 * Check that a player's name is not empty and is not too long.
 * @param ctx
 * @param name
 */
const validatePlayerName = (ctx: Koa.Context, name: string): void => {
  if (name.length === 0) {
    ctx.throw(403, 'Player name cannot be empty.');
  } else if ([...name].length > MAX_PLAYER_NAME_LENGTH) {
    ctx.throw(403, 'Player name too long.');
  }
};

/**
 * Redefinition of interface returned from boardgame.io's `Server()`
 * function.
 * @prop {Router} router
 */
interface Server {
  router: Router<any, ServerTypes.AppCtx>;
  db: StorageAPI.Async | StorageAPI.Sync;
}

/**
 * @param server
 */
export const addCustomMiddleware = (server: Server): void => {
  //
  // === Define middleware ===
  //

  const createMatchMiddleware = async (ctx: Koa.Context, body: object): Promise<object> => {
    const { playerName } = body as createMatchBody;

    // Sanitize and validate player name.
    const sanitizedPlayerName = sanitizePlayerName(playerName);
    validatePlayerName(ctx, sanitizedPlayerName);

    return Promise.resolve(body);
  };

  const joinMatchMiddleware = async (ctx: Koa.Context, body: object): Promise<object> => {
    const { playerName } = body as joinMatchBody;
    const matchID = ctx.params.id as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access

    // Sanitize and validate player name.
    const sanitizedPlayerName = sanitizePlayerName(playerName);
    validatePlayerName(ctx, sanitizedPlayerName);

    // Check for duplicate player names.
    const { metadata } = await (server.db as StorageAPI.Async).fetch(matchID, { metadata: true });
    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }

    for (const player of Object.values(metadata.players)) {
      if (player.name && player.name === sanitizedPlayerName) {
        ctx.throw(409, 'Player name already taken');
      }
    }

    const newBody = { playerName: sanitizedPlayerName };
    return newBody;
  };

  //
  // === Add middleware ===
  //

  server.router.post('/games/:name/create', patchRequest(createMatchMiddleware));
  server.router.post('/games/:name/:id/join', patchRequest(joinMatchMiddleware));
};
