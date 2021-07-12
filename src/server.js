import { Server, Origins } from 'boardgame.io/server';
import { TicTacToe } from './Game';

const server = Server({
  games: [TicTacToe],
  origins: [
    Origins.LOCALHOST,
    "https://shaizijie.herokuapp.com/"],
});

server.run(8000);