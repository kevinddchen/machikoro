import { INVALID_MOVE } from "boardgame.io/core"

const rollDice = (G, ctx, n) => {
    let dice = ctx.random.Die(6, n);
    console.log(dice);
    G.state += 1;
}

const buyEst = (G, ctx, est) => {
    G.money[G.currPlayer] -= G.est_cost[est];
    G.est_buyable[est] -= 1;
    ctx.events.endTurn();
}

export const Machikoro = {

    name: "machikoro",

    setup: (ctx) => ({
        state: 0,
        currPlayer: 0,
        est_cost:       [1, 1, 1, 2, 2, 3, 6, 7, 8, 5, 3, 6, 3, 3, 2],
        est_remaining:  [6, 6, 6, 6, 6, 6, 4, 4, 4, 6, 6, 6, 6, 6, 6],
        est_buyable:    [6, 6, 6, 6, 6, 6, 4, 4, 4, 6, 6, 6, 6, 6, 6],
        money:      Array(ctx.numPlayers).fill(10),
        landmark_1: Array(ctx.numPlayers).fill(false),
        landmark_2: Array(ctx.numPlayers).fill(false),
        landmark_3: Array(ctx.numPlayers).fill(false),
        landmark_4: Array(ctx.numPlayers).fill(false),
    }),

    turn: {
        onBegin: (G, ctx) => {
            G.state = 0;
            G.currPlayer = parseInt(ctx.currentPlayer);
        }
    },

    moves: {
        rollDice,
        buyEst,
    },
  
};