import path from "path";
import serve from "koa-static";
import { Server } from "boardgame.io/server";
import { Machikoro } from "./Game";

const port = process.env.PORT || 80;

// game server
const server = Server({
  games: [Machikoro],
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
