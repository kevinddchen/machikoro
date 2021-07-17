import { INVALID_MOVE } from "boardgame.io/core"

function rollDice(G, ctx, n) {
    const player = ctx.currentPlayer;
    const roll = ctx.random.Die(6, n);
    // go through establishments
    G.state += 1;
}

function buyEst(G, ctx, est) {
    const player = ctx.currentPlayer;
    G.money[player] -= G.est_cost[est];
    G.est_buyable[est] -= 1;
    G[`est_${est}`][player] += 1;
    G.state += 1;
}

function buyLand(G, ctx, land) {
    const player = ctx.currentPlayer;
    G.money[player] -= G.land_cost[land];
    G[`land_${land}`][player] = true;
    G.state += 1;
}

export const Machikoro = {

    name: "machikoro",

    setup: (ctx) => ({
        state: 0,
        est_cost:       [1, 1, 1, 2, 2, 3, 6, 7, 8, 5, 3, 6, 3, 3, 2],
        est_remaining:  [6, 6, 6, 6, 6, 6, 4, 4, 4, 6, 6, 6, 6, 6, 6],
        est_buyable:    [6, 6, 6, 6, 6, 6, 4, 4, 4, 6, 6, 6, 6, 6, 6],
        land_cost:      [4, 10, 16, 22],
        money:      Array(ctx.numPlayers).fill(100), // later set to 3
        est_0:      Array(ctx.numPlayers).fill(1),
        est_1:      Array(ctx.numPlayers).fill(0),
        est_2:      Array(ctx.numPlayers).fill(1),
        est_3:      Array(ctx.numPlayers).fill(0),
        est_4:      Array(ctx.numPlayers).fill(0),
        est_5:      Array(ctx.numPlayers).fill(0),
        est_6:      Array(ctx.numPlayers).fill(0),
        est_7:      Array(ctx.numPlayers).fill(0),
        est_8:      Array(ctx.numPlayers).fill(0),
        est_9:      Array(ctx.numPlayers).fill(0),
        est_10:     Array(ctx.numPlayers).fill(0),
        est_11:     Array(ctx.numPlayers).fill(0),
        est_12:     Array(ctx.numPlayers).fill(0),
        est_13:     Array(ctx.numPlayers).fill(0),
        est_14:     Array(ctx.numPlayers).fill(0),
        land_0:     Array(ctx.numPlayers).fill(false),
        land_1:     Array(ctx.numPlayers).fill(false),
        land_2:     Array(ctx.numPlayers).fill(false),
        land_3:     Array(ctx.numPlayers).fill(false),
    }),

    turn: {
        onBegin: (G, ctx) => {
            G.state = 0;
        }
    },

    moves: {
        rollDice,
        buyEst,
    },
  
};