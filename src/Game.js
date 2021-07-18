
// --- Moves-------------------------------------------------------------------

function rollDice(G, ctx, n) {
    const dice = ctx.random.Die(6, n);
    const roll = dice.reduce( (a, b) => (a+b) );
    G.roll = roll;
    G.log.push(`\troll ${roll} (${dice})`);
}

function commitRoll(G, ctx) {
    const player = parseInt(ctx.currentPlayer),
        N = ctx.numPlayers;
    const backwards = [];
    const forwards = [player];
    for (let i=1; i<N; i++)  {
        backwards.push(((player-i)%N + N)%N); // JS modulo is negative
        forwards.push((player+i)%N);
    }

    switch (G.roll) {
        case 1:
            forwards.map( (p) => (get(G, p, 1*G.est_0[p])));
            break;
        case 2:
            forwards.map( (p) => {
                let amount = 1*G.est_1[p];
                if (p === player) amount += (G.land_1[player] ? 2 : 1)*G.est_2[player];
                get(G, p, amount);
            });
            break;
        case 3:
            backwards.map( (p) => (take(G, player, p, (G.land_1[p] ? 2 : 1)*G.est_3[p])));
            get(G, player, (G.land_1[player] ? 2 : 1)*G.est_2[player]);
            break;
        case 4:
            get(G, player, (G.land_1[player] ? 4 : 3)*G.est_4[player]);
            break;
        case 5:
            forwards.map( (p) => (get(G, p, 1*G.est_5[p])));
            break;
        case 7:
            get(G, player, 3*G.est_9[player]*G.est_1[player]);
            break;
        case 8:
            get(G, player, 3*G.est_10[player]*(G.est_5[player] + G.est_11[player]));
            break;
        case 9:
            backwards.map( (p) => (take(G, player, p, (G.land_1[p] ? 3 : 2)*G.est_12[p])));
            forwards.map( (p) => (get(G, p, 5*G.est_11[p])));
            break;
        case 10:
            backwards.map( (p) => (take(G, player, p, (G.land_1[p] ? 3 : 2)*G.est_12[p])));
            forwards.map( (p) => (get(G, p, 3*G.est_13[p])));
            break;
        case 11:
        case 12:
            get(G, player, 2*G.est_14[player]*(G.est_0[player] + G.est_13[player]));
    }
    G.state = 1;
}

function buyEst(G, ctx, est) {
    const player = ctx.currentPlayer;
    G.money[player] -= G.est_cost[est];
    G.est_buyable[est] -= 1;
    G[`est_${est}`][player] += 1;
    G.state = 2;
}

function buyLand(G, ctx, land) {
    const player = ctx.currentPlayer;
    G.money[player] -= G.land_cost[land];
    G[`land_${land}`][player] = true;
    G.state = 2;
    G.undoRoll = false;
}

// --- Helper functions -------------------------------------------------------

function get(G, player, amount) {
    if (amount > 0) {
        G.money[player] += amount;
        G.log.push(`\t#${player} gets ${amount}`);
    }
}

function take(G, from, to, amount) {
    const max = Math.min(amount, G.money[from]);
    if (max > 0) {
        G.money[from] -= max;
        G.money[to] += max;
        G.log.push(`\t#${from} pays #${to} ${amount}`);
    }
}

export const Machikoro = {

    name: "machikoro",

    setup: (ctx) => ({
        state: 0,
        roll: 0,
        log: [],
        est_cost:       [1, 1, 1, 2, 2, 3, 6, 7, 8, 5, 3, 6, 3, 3, 2],
        est_remaining:  [6, 6, 6, 6, 6, 6, 4, 4, 4, 6, 6, 6, 6, 6, 6],
        est_buyable:    [6, 6, 6, 6, 6, 6, 4, 4, 4, 6, 6, 6, 6, 6, 6],
        land_cost:      [4, 10, 16, 22],
        money:      Array(ctx.numPlayers).fill(3),
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
            G.roll = 0;
            G.log.push(`Turn ${ctx.turn}: #${ctx.currentPlayer}`);
        }
    },

    moves: {
        rollDice,
        commitRoll: {
            move: commitRoll,
            undoable: false,
        },
        buyEst,
        buyLand,
    },
  
};