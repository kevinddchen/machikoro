import path from "path";
import serve from "koa-static";
import { Server, Origins } from "boardgame.io/server";
import { Machikoro } from "./game/Game";

const port = process.env.PORT || 80;

// game server
const server = Server({
  games: [Machikoro],
  origins: [
    // Allow your game site to connect.
    "https://playmachikoro.herokuapp.com/",
    // Allow localhost to connect, except when NODE_ENV is 'production'.
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
});

// serve front-end app from `build`
const frontEndAppBuildPath = path.resolve(__dirname, "../build");
server.app.use(serve(frontEndAppBuildPath));

server.run({
  port: port,
  callback: () => {
    server.app.use(
      async (ctx, next) => await serve(frontEndAppBuildPath)(
        Object.assign(ctx, { path: "index.html" }), 
        next
      )
    );
  },
});
