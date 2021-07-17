import path from "path";
import serve from "koa-static";
import { Server, Origins } from "boardgame.io/server";
import { Machikoro } from "./Game";

const port = process.env.PORT || 80;

// game server
const server = Server({
  games: [Machikoro],
  origins: [
    Origins.LOCALHOST,
    "https://machikororo.herokuapp.com/",
  ],
});

// serve front-end app from `build`
const absolutePath = path.resolve(__dirname, "../build");
server.app.use(serve(absolutePath));

server.run({
  port: port,
  callback: () => {
    server.app.use(
      async (ctx, next) => await serve(absolutePath)(
        Object.assign(ctx, { path: "index.html" }), 
        next
      )
    );
  },
});
