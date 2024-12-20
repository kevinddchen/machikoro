import { Origins, Server } from 'boardgame.io/server';
import path from 'path';
import serve from 'koa-static';

import { Machikoro } from '../game';
import { patchRoutes } from './patch';

const games = [Machikoro];

const PORT = parseInt(process.env.PORT ?? '80');

// game server
const server = Server({
  games,
  origins: [
    // Allow your game site to connect.
    'https://playmachikoro.herokuapp.com',
    // Allow localhost to connect, except when NODE_ENV is 'production'.
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
});

// patch routes with some added validation
patchRoutes(server, games);

// Build path relative to this file
const frontEndAppBuildPath = path.resolve(__dirname, '../../dist');
server.app.use(serve(frontEndAppBuildPath));

void server.run(PORT, () => {
  server.app.use(async (ctx, next) => {
    await serve(frontEndAppBuildPath)(Object.assign(ctx, { path: 'index.html' }), next);
  });
});
