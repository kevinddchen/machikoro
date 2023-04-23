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
    const rawNewBody = JSON.stringify(newBody);

    // Rewrite the request body.
    ctx.req.unshift(rawNewBody);
    ctx.req.headers["content-length"] = rawNewBody.length.toString();
    await next();
  }
}

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

  // Before joining a match, validate the player name.
  const validatePlayerName = async (ctx: ServerTypes.AppCtx, body: object): Promise<object> => {
    console.log(body);
    return body;
  };

  server.router.post('/games/:name/:id/join', patchRequest(validatePlayerName));
};
