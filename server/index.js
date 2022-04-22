import path from 'path';
import serve from 'koa-static';
import { Server, Origins } from 'boardgame.io/server';
import { Machikoro } from '../src/game/Game';
import { PORT } from '../src/config';

// game server
const server = Server({
  games: [Machikoro],
  origins: [
    // Allow your game site to connect.
    'https://playmachikoro.herokuapp.com/',
    // Allow localhost to connect, except when NODE_ENV is 'production'.
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
});

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../build');
server.app.use(serve(frontEndAppBuildPath));

server.run(
  PORT,
  () => {
    server.app.use(
      async (ctx, next) => await serve(frontEndAppBuildPath)(
        Object.assign(ctx, { path: 'index.html' }), 
        next
      )
    );
  },
);
