// @ts-nocheck

import Router from '@koa/router';
import { Server as ServerTypes } from 'boardgame.io/dist/types/src/types';

/**
 * This method returns a middleware function that reads the request body, runs
 * a callback on it to modify it, and then rewrites the request body with the
 * modified version. This is so that `boardgame.io` can parse the modified
 * request body afterwards.
 * 
 * See https://github.com/boardgameio/boardgame.io/issues/1143 for more info
 * on why this is done this way.
 * @param callback - Takes the request body and returns the modified version.
 * @returns A middleware function, to be used with a Koa router.
 */
const patchRequest = (callback: (ctx: ServerTypes.AppCtx, body: object) => Promise<object>) => {
  return async (ctx: ServerTypes.AppCtx, next: () => Promise<any>) => {

    // Read the request body.
    const chunks: Uint8Array[] = [];
    let chunk: Uint8Array;
    while (null !== (chunk = ctx.req.read())) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks).toString('utf8');
    const body = JSON.parse(rawBody);

    const newBody = await callback(ctx, body);
    const rawNewBody = Buffer.from(JSON.stringify(newBody), 'utf8');

    // Rewrite the request body.
    ctx.req.unshift(rawNewBody);
    ctx.req.headers["content-length"] = rawNewBody.length.toString();
    await next();
  }
}

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

const validatePlayerName = (ctx: ServerTypes.AppCtx, name: string): boolean => {
  if (name.length === 0) {
    ctx.throw(403, 'Player name cannot be empty.');
  } else if ([...name].length > 16) {
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
}

/**
 * @param server
 */
export const addCustomMiddleware = (server: Server): void => {

  const joinMatchMiddleware = async (ctx: ServerTypes.AppCtx, body: object): Promise<object> => {
    let playerName = body.playerName as string;
    const matchID = ctx.params.id;

    if (!playerName) {
      ctx.throw(403, 'Player name is required.');
    }

    // Sanitize and validate player name.
    playerName = sanitizePlayerName(playerName);
    validatePlayerName(ctx, playerName);

    const { metadata } = await (server.db as StorageAPI.Async).fetch(matchID, { metadata: true });
    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }

    for (const player of Object.values(metadata.players)) {
      if (player.name && player.name === playerName) {
        ctx.throw(409, 'Player name already taken');
      }
    }

    const newBody = { playerName }
    return newBody;
  };

  server.router.post('/games/:name/:id/join', patchRequest(joinMatchMiddleware));
};
