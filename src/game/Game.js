import { PlayerView, INVALID_MOVE } from 'boardgame.io/core';
import { est_names, land_names } from './text';

/**
 * TODO List:
 * - Add info window with descriptions
 * - !Add expansion cards!
 */

// --- State: roll -------------------------------------------------------------

export function canRollQ(G, ctx, n) {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "roll" && 
    (G.numRolls === 0 || (G.numRolls === 1 && G[`land_${player}`][3])) && 
    ( n === 2 ? G[`land_${player}`][0] : true) 
  );
}

function rollOne(G, ctx) {
  if (canRollQ(G, ctx, 1)) {
    G.roll = ctx.random.Die(6);
    G.numRolls++;
    G.log.push(`\troll ${G.roll}`);
  } else {
    return INVALID_MOVE;
  }
}

function rollTwo(G, ctx) {
  const player = parseInt(ctx.currentPlayer);
  if (canRollQ(G, ctx, 2)) {
    const dice = ctx.random.Die(6, 2);
    if (G[`land_${player}`][2]) G.secondTurn = (dice[0] === dice[1]);
    G.roll = dice.reduce( (a, b) => a+b );
    G.numRolls++;
    G.log.push(`\troll ${G.roll} (${dice})`);
  } else {
    return INVALID_MOVE;
  }
}

function debugRoll(G, ctx, roll) {
  // force roll; removed in production
  G.roll = roll;
  G.numRolls++;
  G.log.push(`\tdebug roll ${G.roll}`);
}

// --- Commit roll -------------------------------------------------------------

export function canCommitRollQ(G, ctx) {
  return G.numRolls > 0 && G.state === "roll";
}

function commitRoll(G, ctx) {
  if (!canCommitRollQ(G, ctx)) {
    return INVALID_MOVE;
  }
  const player = parseInt(ctx.currentPlayer),
        N = ctx.numPlayers,
        backwards = [], // players in backward order
        forwards = [player]; // players in forward order
  for (let i=1; i<N; i++)  {
      backwards.push(((player-i)%N + N)%N); // JS modulo is negative
      forwards.push((player+i)%N);
  }

  switch (G.roll) {
    case 1:
      forwards.forEach( (p) => earn(G, p, 1*G[`est_${p}`][0])); // wheat
      break;
    case 2:
      forwards.forEach( (p) => {
        let amount = 1*G[`est_${p}`][1]; // livestock
        if (p === player) amount += (G[`land_${player}`][1] ? 2 : 1)*G[`est_${player}`][2]; // bakery
        earn(G, p, amount);
      });
      break;
    case 3:
      backwards.forEach( (p) => take(G, player, p, (G[`land_${p}`][1] ? 2 : 1)*G[`est_${p}`][3])); // cafe
      earn(G, player, (G[`land_${player}`][1] ? 2 : 1)*G[`est_${player}`][2]); // bakery
      break;
    case 4:
      earn(G, player, (G[`land_${player}`][1] ? 4 : 3)*G[`est_${player}`][4]); // convenience store
      break;
    case 5:
      forwards.forEach( (p) => earn(G, p, 1*G[`est_${p}`][5])); // forest
      break;
    case 6:
      if (G[`est_${player}`][6] > 0) backwards.forEach( (p) => take(G, p, player, 2)); // stadium
      if (G[`est_${player}`][7] > 0) G.doTV = true;
      if (G[`est_${player}`][8] > 0) G.doOffice = true;
      break;
    case 7:
      earn(G, player, 3*G[`est_${player}`][9]*G[`est_${player}`][1]); // cheese factory
      break;
    case 8:
      earn(G, player, 3*G[`est_${player}`][10]*(G[`est_${player}`][5] + G[`est_${player}`][11])); // furniture factory
      break;
    case 9:
      backwards.forEach( (p) => take(G, player, p, (G[`land_${p}`][1] ? 3 : 2)*G[`est_${p}`][12])); // restaurant
      forwards.forEach( (p) => earn(G, p, 5*G[`est_${p}`][11])); // mine
      break;
    case 10:
      backwards.forEach( (p) => take(G, player, p, (G[`land_${p}`][1] ? 3 : 2)*G[`est_${p}`][12])); // restaurant
      forwards.forEach( (p) => earn(G, p, 3*G[`est_${p}`][13])); // apple orchard
      break;
    case 11:
    case 12:
      earn(G, player, 2*G[`est_${player}`][14]*(G[`est_${player}`][0] + G[`est_${player}`][13])); // produce market
      break;
    default:
      break;
  }
  afterCommit(G);
}

function earn(G, to, amount) {
  if (amount > 0) {
    G.money[to] += amount;
    G.log.push(`\t#${to} earns ${amount} $`);
  }
}

function take(G, from, to, amount) {
  const max = Math.min(amount, G.money[from]);
  if (max > 0) {
    G.money[from] -= max;
    G.money[to] += max;
    G.log.push(`\t#${from} pays #${to} ${amount} $`);
  }
}

function afterCommit(G) {
  if (G.doTV) {
    G.state = "tv";
  } else if (G.doOffice) {
    G.state = "office1";
  } else {
    G.state = "buy";
  }
}

// --- State: buy --------------------------------------------------------------

export function canBuyEstQ(G, ctx, est) {
  const player = parseInt(ctx.currentPlayer);
  const buyable = (
    G.state === "buy" && 
    G.est_supply[est] > 0 && 
    G.money[player] >= G.est_cost[est]
  );
  if (est === 6) return (buyable && G[`est_${player}`][6] === 0);
  if (est === 7) return (buyable && G[`est_${player}`][7] === 0);
  if (est === 8) return (buyable && G[`est_${player}`][8] === 0);
  return buyable;
}

function buyEst(G, ctx, est) {
  const player = parseInt(ctx.currentPlayer);
  if (canBuyEstQ(G, ctx, est)) {
    G.money[player] -= G.est_cost[est];
    G.est_supply[est]--;
    G.est_total[est]--;
    G[`est_${player}`][est]++;
    G.state = "end";
    G.log.push(`\tbuy ${est_names[est]}`);
  } else {
    return INVALID_MOVE;
  }
}

export function canBuyLandQ(G, ctx, land) {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "buy" && 
    !G[`land_${player}`][land] &&
    G.money[player] >= G.land_cost[land]
  );
}

function buyLand(G, ctx, land) {
  const player = parseInt(ctx.currentPlayer);
  if (canBuyLandQ(G, ctx, land)) {
    G.money[player] -= G.land_cost[land];
    G[`land_${player}`][land] = true;
    G.state = "end";
    G.log.push(`\tbuy ${land_names[land]}`);
    checkEndGame(G, ctx, player);
  } else {
    return INVALID_MOVE;
  }
}

// --- Special moves -----------------------------------------------------------

export function canDoTVQ(G, ctx, p) {
  const player = parseInt(ctx.currentPlayer);
  return G.state === "tv" && p !== player;
}

function doTV(G, ctx, p) {
  const player = parseInt(ctx.currentPlayer);
  if (canDoTVQ(G, ctx, p)) {
    take(G, p, player, 5);
    G.doTV = false;
    afterCommit(G);
  } else {
    return INVALID_MOVE;
  }
};

export function canDoOffice1Q(G, ctx, est) {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "office1" &&
    ![6, 7, 8].includes(est) &&
    G[`est_${player}`][est] > 0
  );
}

function doOffice1(G, ctx, est) {
  if (canDoOffice1Q(G, ctx, est)) {
    G.officeEst = est;
    G.state = "office2";
  } else {
    return INVALID_MOVE;
  }
}

export function canDoOffice2Q(G, ctx, p, est) {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "office2" &&
    p !== player && 
    ![6, 7, 8].includes(est) &&
    G[`est_${p}`][est] > 0
  );
}

function doOffice2(G, ctx, p, est) {
  const player = parseInt(ctx.currentPlayer);
  if (canDoOffice2Q(G, ctx, p, est)) {
    G[`est_${player}`][G.officeEst]--;
    G[`est_${player}`][est]++;
    G[`est_${p}`][est]--;
    G[`est_${p}`][G.officeEst]++;
    G.doOffice = false;
    G.log.push(`\ttrade ${est_names[G.officeEst]} for ${est_names[est]} with #${p}`);
    afterCommit(G);
  } else {
    return INVALID_MOVE;
  }
}

// --- State management --------------------------------------------------------

export function canEndQ(G, ctx) {
  return G.state === "buy" || G.state === "end";
}

function endTurn(G, ctx) {
  const player = parseInt(ctx.currentPlayer);
  if (canEndQ(G, ctx)) {
    if (G.secondTurn) {
      ctx.events.endTurn({next: player});
    } else {
      ctx.events.endTurn();
    }
  } else {
    return INVALID_MOVE;
  }
}

function checkEndGame(G, ctx, p) {
  // only done in `buyLand`
  if (G[`land_${p}`].every( x => x)) {
    G.log.push(`Game over. Winner: #${p}`);
    ctx.events.endGame();
  }
}

// --- Variable supply ---------------------------------------------------------

function checkDrawEst(G, ctx) {
  let count = 0;
  G.est_supply.forEach( (x) => {if (x > 0) count++});
  return count < G.numReplenish;
}

function replenishSupply(G, ctx) {
  while (G.secret.length > 0 && checkDrawEst(G, ctx)) {
    const est = G.secret.pop();
    G.est_supply[est]++;
  }
}

// --- Game --------------------------------------------------------------------

export const gameName = "machikoro";

const defaultSetupData = {
  supplyVariant: "var",
};

export const Machikoro = {

  name: gameName,

  setup: (ctx, setupData) => {
    const n = ctx.numPlayers;
    const G = {
      est_cost:   [1, 1, 1, 2, 2, 3, 6, 7, 8, 5, 3, 6, 3, 3, 2],
      est_supply: Array(15).fill(0),
      est_total:  [6, 6, 6, 6, 6, 6, n, n, n, 6, 6, 6, 6, 6, 6],
      land_cost:  [4, 10, 16, 22],
      money: Array(n).fill(100),
      log: [],
    };
    // starting establishments
    for (let p=0; p<ctx.numPlayers; p++) {
      G[`est_${p}`] =   [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      G[`land_${p}`] =  [false, false, false, false];
    }
    // shuffle deck; this is stripped from G given to players
    G.secret = [];
    for (let est=0; est<G.est_total.length; est++) {
      G.secret = G.secret.concat(Array(G.est_total[est]).fill(est));
    }
    G.secret = ctx.random.Shuffle(G.secret);
    // additional setup
    if (!setupData) setupData = defaultSetupData;
    const { supplyVariant } = setupData;
    if (supplyVariant === "tot") G.numReplenish = 100; // set to large number
    if (supplyVariant === "var") G.numReplenish = 10;

    return G;
  },

  validateSetupData: (setupData, numPlayers) => {
    if (setupData) {
      const { supplyVariant } = setupData;
      if (!["tot", "var"].includes(supplyVariant)) return false;
    }
    if (numPlayers < 2) return false;
    if (numPlayers > 5) return false;
  },

  turn: {
    onBegin: (G, ctx) => {
      replenishSupply(G, ctx);
      G.state = "roll";
      G.roll = 0;
      G.numRolls = 0;
      G.doTV = false;
      G.doOffice = false;
      G.officeEst = null;
      G.secondTurn = false;
      G.log.push(`Turn ${ctx.turn}: #${ctx.currentPlayer}`);
    }
  },

  moves: {
    rollOne: {
      move: rollOne,
      undoable: false,
    },
    rollTwo: {
      move: rollTwo,
      undoable: false,
    },
    debugRoll: {
      move: debugRoll,
      redact: true,
    },
    commitRoll: {
      move: commitRoll,
      undoable: false,
    },
    buyEst: buyEst,
    buyLand: buyLand,
    doTV: doTV,
    doOffice1: doOffice1,
    doOffice2: doOffice2,
    endTurn: endTurn,
  },

  playerView: PlayerView.STRIP_SECRETS,
  
};
