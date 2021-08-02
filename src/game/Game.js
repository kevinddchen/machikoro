import { PlayerView, TurnOrder, INVALID_MOVE } from 'boardgame.io/core';
import { est_names, land_names, deck1, deck2, deck3 } from './meta';

// --- Roll dice ---------------------------------------------------------------

export function canRollQ(G, ctx, n) {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "roll" && 
    (n === 1 || (n === 2 && G[`land_${player}`][0])) && // train station 
    (G.numRolls === 0 || (G.numRolls === 1 && G[`land_${player}`][3])) // radio tower
  );
}

/**
 * Roll one die.
 */
function rollOne(G, ctx) {
  if (canRollQ(G, ctx, 1)) {
    G.roll = ctx.random.Die(6);
    G.numRolls++;
    log(G, `\troll ${G.roll}`);
  } else {
    return INVALID_MOVE;
  }
}

/**
 * Roll two dice (train station).
 */
function rollTwo(G, ctx) {
  const player = parseInt(ctx.currentPlayer);
  if (canRollQ(G, ctx, 2)) {
    const dice = ctx.random.Die(6, 2);
    if (G[`land_${player}`][2]) 
      G.secondTurn = (dice[0] === dice[1]); // amusement park
    G.roll = dice.reduce( (a, b) => a+b );
    G.numRolls++;
    log(G, `\troll ${G.roll} (${dice})`);
  } else {
    return INVALID_MOVE;
  }
}

/**
 * Force roll outcome; this move is removed in production.
 */
function debugRoll(G, ctx, roll) {
  G.roll = roll;
  G.numRolls++;
  log(G, `\tdebug roll ${G.roll}`);
}

// --- Commit roll -------------------------------------------------------------

export function canCommitRollQ(G, ctx) {
  return G.numRolls > 0 && G.state === "roll";
}

/**
 * Evaluate outcome of roll
 */
function commitRoll(G, ctx) {
  if (!canCommitRollQ(G, ctx)) {
    return INVALID_MOVE;
  }
  // get list of players in forward/backward order. Forward order includes
  // current player, backward order excludes current player.
  const { forwards, backwards } = getForwardsBackwards(G, ctx);
  const player = parseInt(ctx.currentPlayer);

  switch (G.roll) {
    case 1:
      backwards.forEach( (p) => {
        if (G[`land_${p}`][5]) take(G, player, p, (G[`land_${p}`][1] ? 4 : 3)*G[`est_${p}`][15]); // sushi bar
      }); 
      forwards.forEach( (p) => earn(G, p, 1*G[`est_${p}`][0])); // wheat field
      break;
    case 2:
      forwards.forEach( (p) => {
        let amount = 1*G[`est_${p}`][1]; // livestock farm
        if (p === player) amount += (G[`land_${player}`][1] ? 2 : 1)*G[`est_${player}`][2]; // bakery
        earn(G, p, amount);
      });
      break;
    case 3:
      backwards.forEach( (p) => take(G, player, p, (G[`land_${p}`][1] ? 2 : 1)*G[`est_${p}`][3])); // cafe
      earn(G, player, (G[`land_${player}`][1] ? 2 : 1)*G[`est_${player}`][2]); // bakery
      break;
    case 4:
      forwards.forEach( (p) => {
        let amount = 1*G[`est_${p}`][16]; // flower orchard
        if (p === player) amount += (G[`land_${player}`][1] ? 4 : 3)*G[`est_${player}`][4]; // convenience store
        earn(G, p, amount);
      });
      break;
    case 5:
      forwards.forEach( (p) => earn(G, p, 1*G[`est_${p}`][5])); // forest
      break;
    case 6:
      earn(G, player, (G[`land_${player}`][1] ? 2 : 1)*G[`est_${player}`][17]*G[`est_${player}`][16]); // flower shop
      if (G[`est_${player}`][6] > 0) backwards.forEach( (p) => take(G, p, player, 2)); // stadium
      if (G[`est_${player}`][7] > 0) G.doTV = true; // TV station
      if (G[`est_${player}`][8] > 0) G.doOffice = true; // office
      break;
    case 7:
      backwards.forEach( (p) => take(G, player, p, (G[`land_${p}`][1] ? 2 : 1)*G[`est_${p}`][18])); // pizza joint
      earn(G, player, 3*G[`est_${player}`][9]*countAnimal(G, player)); // cheese factory
      if (G[`est_${player}`][19] > 0) 
        backwards.forEach( (p) => take(G, p, player, countCup(G, p)+countBread(G, p) )); // publisher
      break;
    case 8:
      backwards.forEach( (p) => take(G, player, p, (G[`land_${p}`][1] ? 2 : 1)*G[`est_${p}`][21])); // hamburger stand
      forwards.forEach( (p) => {
        let amount = (G[`land_${p}`][5] ? 3 : 0)*G[`est_${p}`][20]; // mackerel boat
        if (p === player) amount += 3*G[`est_${player}`][10]*countGear(G, player); // furniture factory
        earn(G, p, amount);
      });
      if (G[`est_${player}`][22] > 0) backwards.forEach( (p) => {
        if (G.money[p] >= 10) take(G, p, player, Math.floor(G.money[p]/2)); // tax office
      });
      break;
    case 9:
      backwards.forEach( (p) => take(G, player, p, (G[`land_${p}`][1] ? 3 : 2)*G[`est_${p}`][12])); // restaurant
      forwards.forEach( (p) => earn(G, p, 5*G[`est_${p}`][11])); // mine
      if (G[`est_${player}`][22] > 0) backwards.forEach( (p) => {
        if (G.money[p] >= 10) take(G, p, player, Math.floor(G.money[p]/2)); // tax office
      });
      break;
    case 10:
      backwards.forEach( (p) => take(G, player, p, (G[`land_${p}`][1] ? 3 : 2)*G[`est_${p}`][12])); // restaurant
      forwards.forEach( (p) => earn(G, p, 3*G[`est_${p}`][13])); // apple orchard
      break;
    case 11:
    case 12:
    case 13:
    case 14:
      forwards.forEach( (p) => {
        let amount = 0;
        if ([12, 13, 14].includes(G.roll) && G[`land_${p}`][5] > 0 && G[`est_${p}`][23] > 0) {
          let roll = ctx.random.Die(6, 2).reduce( (a, b) => a+b );
          amount += roll*G[`est_${p}`][23]; // tuna boat
          log(G, `\t(tuna boat roll: ${roll})`);
        }
        if ([11, 12].includes(G.roll) && p === player) 
          amount += 2*G[`est_${player}`][14]*countPlant(G, player); // produce market
        if ([12, 13].includes(G.roll) && p === player)
          amount += 2*G[`est_${player}`][24]*countCup(G, player); // food warehouse
        earn(G, p, amount);
      });
      break;
    default:
      return INVALID_MOVE;
  }
  afterCommit(G);
}

function getForwardsBackwards(G, ctx) {
  let current = ctx.playOrderPos,
      N = ctx.numPlayers,
      forwards = [ctx.playOrderPos],
      backwards = []; 
  for (let i=1; i<N; i++)  {
    forwards.push((current+i)%N);
    backwards.push(((current-i)%N + N)%N); // JS modulo is negative
  }
  forwards = forwards.map( (x) => parseInt(G.turn_order[x]) );
  backwards = backwards.map( (x) => parseInt(G.turn_order[x]) );
  return { forwards, backwards };
}

// `to` receives coins from the bank
function earn(G, to, amount) {
  if (amount > 0) {
    G.money[to] += amount;
    log(G, `\t#${to} earns ${amount} $`);
  }
}

// `from` gives coins to `to`
function take(G, from, to, amount) {
  const max = Math.min(amount, G.money[from]);
  if (max > 0) {
    G.money[from] -= max;
    G.money[to] += max;
    log(G, `\t#${from} pays #${to} ${max} $`);
  }
}

function countCup(G, p) {
  const ests = G[`est_${p}`];
  return ests[3] + ests[12] + ests[15] + ests[18] + ests[21];
}

function countBread(G, p) {
  const ests = G[`est_${p}`];
  return ests[2] + ests[4] + ests[17];
}

function countAnimal(G, p) {
  const ests = G[`est_${p}`];
  return ests[1];
}

function countGear(G, p) {
  const ests = G[`est_${p}`];
  return ests[5] + ests[11];
}

function countPlant(G, p) {
  const ests = G[`est_${p}`];
  return ests[0] + ests[13] + ests[16];
}

/**
 * Check if any purple (major) establishments need to be performed.
 */
function afterCommit(G) {
  if (G.doTV) {
    G.state = "tv";
  } else if (G.doOffice) {
    G.state = "office1";
  } else {
    G.state = "buy";
  }
}

export function canAddTwoQ(G, ctx) {
  const player = parseInt(ctx.currentPlayer);
  return (
    canCommitRollQ(G, ctx) &&
    G[`land_${player}`][5] &&
    G.roll >= 10
  );
}

/**
 * Variant of `commitRoll` where 2 is added to dice roll (harbor).
 */
function addTwo(G, ctx) {
  if (canAddTwoQ(G, ctx)) {
    G.roll += 2;
    log(G, `\tchange roll to ${G.roll}`);
    commitRoll(G, ctx);
  } else {
    return INVALID_MOVE;
  }
}

// --- Buy establishments/landmarks --------------------------------------------

export function canBuyEstQ(G, ctx, est) {
  const player = parseInt(ctx.currentPlayer);
  const buyable = (
    G.state === "buy" && 
    G.est_use[est] && 
    G.est_supply[est] > 0 && 
    ((G.money[player] >= G.est_cost[est]) || 
     (G[`land_${player}`][4] && G.money[player] === 0 && G.est_cost[est] === 1) // city hall
    ) 
  );
  if (deck3.includes(est)) {
    return (buyable && G[`est_${player}`][est] === 0);
  } else {
    return buyable;
  }
}

/** 
 * Buy an establishment.
 */
function buyEst(G, ctx, est) {
  const player = parseInt(ctx.currentPlayer);
  if (canBuyEstQ(G, ctx, est)) {
    G.money[player] = Math.max(G.money[player] - G.est_cost[est], 0); // prevent go below 0
    G.est_supply[est]--;
    G.est_total[est]--;
    G[`est_${player}`][est]++;
    G.state = "end";
    log(G, `\tbuy ${est_names[est]}`);
  } else {
    return INVALID_MOVE;
  }
}

export function canBuyLandQ(G, ctx, land) {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "buy" && 
    G.land_use[land] && 
    !G[`land_${player}`][land] &&
    G.money[player] >= G.land_cost[land]
  );
}

/**
 * Buy a landmark.
 */
function buyLand(G, ctx, land) {
  const player = parseInt(ctx.currentPlayer);
  if (canBuyLandQ(G, ctx, land)) {
    G.money[player] -= G.land_cost[land];
    G[`land_${player}`][land] = true;
    G.state = "end";
    log(G, `\tbuy ${land_names[land]}`);
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

/**
 * Pick another player to take money from.
 */
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
    G.est_use[est] && 
    !deck3.includes(est) &&
    G[`est_${player}`][est] > 0
  );
}

/**
 * Pick your own establishment to trade.
 */
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
    G.est_use[est] && 
    !deck3.includes(est) &&
    G[`est_${p}`][est] > 0
  );
}

/** 
 * Pick someone else's establishment to trade.
 */
function doOffice2(G, ctx, p, est) {
  const player = parseInt(ctx.currentPlayer);
  if (canDoOffice2Q(G, ctx, p, est)) {
    G[`est_${player}`][G.officeEst]--;
    G[`est_${player}`][est]++;
    G[`est_${p}`][est]--;
    G[`est_${p}`][G.officeEst]++;
    G.doOffice = false;
    log(G, `\ttrade ${est_names[G.officeEst]} for ${est_names[est]} with #${p}`);
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
    if (G.state === "buy" && G[`land_${player}`][6]) 
      earn(G, player, 10); // airport
    if (G.secondTurn) {
      ctx.events.endTurn({next: player}); // amusement park
    } else {
      ctx.events.endTurn();
    }
  } else {
    return INVALID_MOVE;
  }
}

// end-of-game only checked in `buyLand` move.
function checkEndGame(G, ctx, p) {
  for (let land=0; land<G.land_use.length; land++) {
    if (G.land_use[land] && !G[`land_${p}`][land])
      return;
  }
  log(G, `Game over. Winner: #${p}`);
  ctx.events.endGame();
}

/**
 * Add entry to the log.
 */
function log(G, msg) {
  G.log.push({id: G.log_i, msg});
  G.log_i++;
  while (G.log.length > 100) {
    G.log.shift();
  }
}

// --- Supply replenishment ----------------------------------------------------

/**
 * Set up establishment supply at start of game.
 */
function setupSupply(G, ctx, supplyVariant) {
  if (supplyVariant === "total") {
    // set all supply to total
    for (let est=0; est<G.est_use.length; est++) {
      if (G.est_use[est])
        G.est_supply[est] = G.est_total[est];
    }
  } else if (supplyVariant === "variable") {
    // fill deck with establishments and shuffle
    for (let est=0; est<G.est_use.length; est++) {
      if (G.est_use[est])
        G.secret = G.secret.concat(Array(G.est_total[est]).fill(est));
    }
    G.secret = ctx.random.Shuffle(G.secret);
  } else if (supplyVariant === "hybrid") {
    // fill all three decks and shuffle
    const deckList = [deck1, deck2, deck3];
    for (let i=0; i<=2; i++) {
      let deck = [];
      for (let est of deckList[i]) {
        if (G.est_use[est])
          deck = deck.concat(Array(G.est_total[est]).fill(est));
      }
      deck = ctx.random.Shuffle(deck);
      G.secret.push(deck);
    }
  }
}

/**
 * Replenish establishments at start of each turn.
 */
function replenishSupply(G, ctx) {
  const { supplyVariant } = G;
  if (supplyVariant === "variable") {
    // if less than 10 unique establishments, draw from deck
    const target = 10;
    while (G.secret.length > 0) {
      let count = 0;
      G.est_supply.forEach( (x) => {if (x > 0) count++} );
      if (count >= target)
        break;
      G.est_supply[G.secret.pop()]++;
    }
  } else if (supplyVariant === "hybrid") {
    // for each deck want 5-5-2 establishments
    const deckList = [deck1, deck2, deck3];
    const targets = [5, 5, 2];
    for (let i=0; i<=2; i++) {
      while (G.secret[i].length > 0) {
        let count = 0;
        for (let est of deckList[i]) {
          if (G.est_supply[est] > 0) 
            count++;
        }
        if (count >= targets[i])
          break;
        G.est_supply[G.secret[i].pop()]++;
      }
    }
  }
}

// --- Game --------------------------------------------------------------------

export const gameName = "machikoro";

// set-up to use in debug mode
const debugSetupData = {
  expansion: "harbor",
  supplyVariant: "total",
  startCoins: 99,
  randomizeTurnOrder: false,
};

export const Machikoro = {

  name: gameName,

  setup: (ctx, setupData) => {
    if (!setupData) setupData = debugSetupData;
    const { expansion, supplyVariant, startCoins, randomizeTurnOrder } = setupData;

    const n = ctx.numPlayers;
    const G = {
      turn_order: [...Array(n).keys()].map( (x) => x.toString() ),
      est_cost:   [1, 1, 1, 2, 2, 3, 6, 7, 8, 5, 3, 6, 3, 3, 2, // cost of each establishment
                   2, 2, 1, 1, 5, 2, 1, 4, 5, 2],
      est_supply: Array(25).fill(0), // number of each establishment available to buy
      est_total:  [6, 6, 6, 6, 6, 6, n, n, n, 6, 6, 6, 6, 6, 6, // total copies of each establishment
                   6, 6, 6, 6, n, 6, 6, n, 6, 6],
      land_cost:  [4, 10, 16, 22, 0, 2, 30], // cost of each landmark
      money:      Array(n).fill(startCoins),
      log: [],
      log_i: 0,
    };
    // shuffle play order?
    if (randomizeTurnOrder) 
      G.turn_order = ctx.random.Shuffle(G.turn_order);
    // starting establishments
    for (let p=0; p<n; p++) {
      G[`est_${p}`] =   [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // each player's establishments
                         0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      G[`land_${p}`] =  Array(7).fill(false); // each player's landmarks
    }
    // expansion
    if (expansion === "base") {
      G.est_use = Array(15).fill(true).concat(Array(10).fill(false)); // use establishment in this game?
      G.land_use = Array(4).fill(true).concat(Array(3).fill(false)); // use landmark in this game?
    } else if (expansion === "harbor") {
      G.est_use = Array(25).fill(true);
      G.land_use = Array(7).fill(true);
      for (let p=0; p<n; p++) {
        G[`land_${p}`][4] = true; // each player starts with city hall
      }
    }
    G.secret = []; // secret is stripped from the G given to players
    G.supplyVariant = supplyVariant;
    setupSupply(G, ctx, supplyVariant);

    return G;
  },

  validateSetupData: (setupData, numPlayers) => {
    if (setupData) {
      const { expansion, supplyVariant, startCoins } = setupData;
      if (!["base", "harbor"].includes(expansion)) return false;
      if (!["total", "variable", "hybrid"].includes(supplyVariant)) return false;
      if (!Number.isInteger(startCoins)) return false; 
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
      log(G, `Turn ${ctx.turn}: #${ctx.currentPlayer}`);
    },
    order: TurnOrder.CUSTOM_FROM('turn_order'),
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
    addTwo: {
      move: addTwo,
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
