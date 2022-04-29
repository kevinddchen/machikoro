import { PlayerView, TurnOrder, INVALID_MOVE } from 'boardgame.io/core';
import { est_names, land_names, deck1, deck2, deck3 } from './meta';
import type { Ctx, Game, Move } from 'boardgame.io';

/**
 * === Machikoro core game logic ===
 * 
 * We use the `boardgame.io` framework: https://boardgame.io/. It handles all 
 * interactions between the client and the server. All what we have to do is 
 * define the `Machikoro` object at the bottom on this file.
 * 
 * `G` is an object that represents the game state.
 * `ctx` is a read-only object that contains some useful metadata.
 * 
 * Functions that have the name `can___Q` are queries whether a move is legal or 
 * not, and return boolean values. These used internally and are also passed to 
 * the client to render things correctly.
 * 
 * === Internal ===
 * 
 * `G.state` tracks the player's internal state. The possible values are
 *    roll: rolling dice
 *    tv: doing tv action
 *    office1: doing office action, picking own establishment
 *    office2: doing office action, picking opponent establishment
 *    buy: buy an establishment
 *    end: player is done everything, but can undo if they wish
 */

export const GAME_NAME = "machikoro";

export interface MachikoroG {
  state: string,
  roll: number,
  numRolls: number;
  money: number[];
  turn_order: string[];
  est_cost: number[];
  est_supply: number[];
  est_total: number[];
  land_cost: number[];
  est_use: boolean[];
  land_use: boolean[];
  supplyVariant: string;
  land: boolean[][];
  est: number[][];
  secret: any[];
  log: any[];
  log_i: number;
  secondTurn?: boolean;
  doTV?: boolean;
  doOffice?: boolean;
  officeEst?: number;
}

// --- Queries ----------------------------------------------------------------
// These functions are used to internally to check whether a move is legal or 
// not, and externally for the client to render things correctly.

/**
 * @param G
 * @param ctx
 * @param n - Number of dice to roll.
 * @returns True if the current player can roll `n` number of dice.
 */
export const canRoll = (G: MachikoroG, ctx: Ctx, n: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "roll" && 
    (n === 1 || (n === 2 && G.land[player][0])) && // train station 
    (G.numRolls === 0 || (G.numRolls === 1 && G.land[player][3])) // radio tower
  );
}

/**
 * @param G 
 * @returns True if the current player has rolled the dice and can proceed
 *  to evaluate its outcome.
 */
 export const canCommitRoll = (G: MachikoroG): boolean => {
  return G.numRolls > 0 && G.state === "roll";
}

/**
 * @param G
 * @param ctx
 * @returns True if the current player can activate Harbor.
 */
export const canAddTwo = (G: MachikoroG, ctx: Ctx): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    canCommitRoll(G) &&
    G.land[player][5] &&
    G.roll >= 10
  );
}

/**
 * @param G 
 * @param ctx 
 * @returns True if the current player cannot roll the dice or activate Harbor.
 */
export const canSkipConfirmation = (G: MachikoroG, ctx: Ctx): boolean => {
  return !(canAddTwo(G, ctx) || canRoll(G, ctx, 1) || canRoll(G, ctx, 2));
}

/**
 * @param G 
 * @param ctx 
 * @param est - Establishment to buy.
 * @returns True if the current player can buy the establishment `est`.
 */
export const canBuyEst = (G: MachikoroG, ctx: Ctx, est: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  const buyable = (
    G.state === "buy" && 
    G.est_use[est] && 
    G.est_supply[est] > 0 && 
    G.money[player] >= G.est_cost[est]
  );
  if (deck3.includes(est)) {
    return (buyable && G.est[player][est] === 0);
  } else {
    return buyable;
  }
}

/**
 * @param G 
 * @param ctx 
 * @param land - Landmark to buy.
 * @returns True if the current player can buy the landmark `land`.
 */
export const canBuyLand = (G: MachikoroG, ctx: Ctx, land: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "buy" && 
    G.land_use[land] && 
    !G.land[player][land] &&
    G.money[player] >= G.land_cost[land]
  );
}

/**
 * @param G
 * @param ctx 
 * @param p - Opponent player to take money from.
 * @returns True if the current player can take money from opponent `p`, as a 
 *  TV action.
 */
export const canDoTV = (G: MachikoroG, ctx: Ctx, p: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return G.state === "tv" && p !== player;
}

/**
 * @param G 
 * @param ctx 
 * @param est - Establishment you own to give up.
 * @returns True if the current player can pick `est` as the establishment to
 *  give up, as the first phase of the office action.
 */
export const canDoOfficePhase1 = (G: MachikoroG, ctx: Ctx, est: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "office1" &&
    G.est_use[est] && 
    !deck3.includes(est) &&
    G.est[player][est] > 0
  );
}

/**
 * @param G 
 * @param ctx 
 * @param p - Opponent to take an establishment from.
 * @param est - Establishment to take.
 * @returns True if the current player can take an opponent `p`'s establishment
 *  `est`, as the second phase of the office action.
 */
export const canDoOfficePhase2 = (G: MachikoroG, ctx: Ctx, p: number, est: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === "office2" &&
    p !== player && 
    G.est_use[est] && 
    !deck3.includes(est) &&
    G.est[p][est] > 0
  );
}

/**
 * @param G
 * @returns True if the current player can end their turn.
 */
export const canEndTurn = (G: MachikoroG): boolean => {
  return G.state === "buy" || G.state === "end";
}

/**
 * @param G 
 * @param ctx 
 * @returns True if the current player has won the game.
 */
export const canEndGame = (G: MachikoroG, ctx: Ctx): boolean => {
  const player = parseInt(ctx.currentPlayer);
  for (let land = 0; land < G.land_use.length; land++)
    if (G.land_use[land] && !G.land[player][land])
      return false;
  return true;
}

// --- Moves ------------------------------------------------------------------
// These are moves the player can make, and are called in the `Game` object.

/**
 * Roll one die.
 * @param G
 * @param ctx
 */
const rollOne: Move<MachikoroG> = (G, ctx) => {
  if (!canRoll(G, ctx, 1)) return INVALID_MOVE;

  G.roll = ctx.random!.Die(6);
  G.numRolls++;
  log(G, `\troll ${G.roll}`);
  if (canSkipConfirmation(G, ctx))
    commitRoll(G, ctx);
  return;
}

/**
 * Roll two dice.
 * @param G
 * @param ctx
 */
const rollTwo: Move<MachikoroG> = (G, ctx) => {
  if (!canRoll(G, ctx, 2)) return INVALID_MOVE;

  const player = parseInt(ctx.currentPlayer);
  const dice = ctx.random!.Die(6, 2);
  if (G.land[player][2]) 
    G.secondTurn = (dice[0] === dice[1]); // amusement park
  G.roll = dice[0] + dice[1];
  G.numRolls++;
  log(G, `\troll ${G.roll} (${dice})`);
  if (canSkipConfirmation(G, ctx))
    commitRoll(G, ctx);
  return;
}

/**
 * Force roll outcome; this move is removed in production.
 * @param G
 * @param ctx
 * @param roll - Forced outcome of the dice.
 */
const debugRoll: Move<MachikoroG> = (G, ctx, roll: number) => {
  G.roll = roll;
  G.numRolls++;
  log(G, `\tdebug roll ${G.roll}`);
  if (canSkipConfirmation(G, ctx))
    commitRoll(G, ctx);
  return;
}

/**
 * Do not activate Harbor and keep the current roll.
 * @param G
 * @param ctx
 */
const keepRoll: Move<MachikoroG> = (G, ctx) => {
  if (!canCommitRoll(G)) return INVALID_MOVE;
  
  commitRoll(G, ctx);
  return;
}

/**
 * Activate Harbor and add 2 to the current roll.
 * @param G
 * @param ctx
 */
const addTwo: Move<MachikoroG> = (G, ctx) => {
  if (!canAddTwo(G, ctx)) return INVALID_MOVE;

  G.roll += 2;
  log(G, `\tchange roll to ${G.roll}`);
  commitRoll(G, ctx);
  return;
}

/** 
 * Buy an establishment.
 * @param G
 * @param ctx
 * @param est - Establishment to buy.
 */
const buyEst: Move<MachikoroG> = (G, ctx, est: number) => {
  if (!canBuyEst(G, ctx, est)) return INVALID_MOVE;

  const player = parseInt(ctx.currentPlayer);
  G.money[player] -= G.est_cost[est];
  G.est_supply[est]--;
  G.est_total[est]--;
  G.est[player][est]++;
  G.state = "end";
  log(G, `\tbuy ${est_names[est]}`);
  return;
}

/**
 * Buy a landmark.
 * @param G
 * @param ctx
 * @param land - Landmark to buy.
 */
const buyLand: Move<MachikoroG> = (G, ctx, land: number) => {
  if (!canBuyLand(G, ctx, land)) return INVALID_MOVE;

  const player = parseInt(ctx.currentPlayer);
  G.money[player] -= G.land_cost[land];
  G.land[player][land] = true;
  G.state = "end";
  log(G, `\tbuy ${land_names[land]}`);
  if (canEndGame(G, ctx))
    endGame(G, ctx, player);
  return;
}

/**
 * Activate the TV establishment.
 * @param G
 * @param ctx
 * @param p - Opponent player to take money from.
 */
const doTV: Move<MachikoroG> = (G, ctx, p: number) => {
  if (!canDoTV(G, ctx, p)) return INVALID_MOVE;

  const player = parseInt(ctx.currentPlayer);
  take(G, {from: p, to: player, amount: 5});
  G.doTV = false;
  switchState(G, ctx);
  return;
};

/**
 * Activate the office establishment. For the first phase, pick an 
 * establishment you own to give up.
 * @param G
 * @param ctx
 * @param est - Establishment you own to give up.
 */
const doOfficePhase1: Move<MachikoroG> = (G, ctx, est: number) => {
  if (!canDoOfficePhase1(G, ctx, est)) return INVALID_MOVE;

  G.officeEst = est;
  G.state = "office2";
  return;
}

/** 
 * Activate the office establishment. For the second phase, pick an 
 * establishment an opponent owns to take.
 * @param G
 * @param ctx
 * @param p - Opponent player to take an establishment from.
 * @param est - Establishment to take.
 */
const doOfficePhase2: Move<MachikoroG> = (G, ctx, p: number, est: number) => {
  if (!canDoOfficePhase2(G, ctx, p, est)) return INVALID_MOVE;

  const player = parseInt(ctx.currentPlayer);
  const officeEst = G.officeEst!;
  G.est[player][officeEst]--;
  G.est[player][est]++;
  G.est[p][est]--;
  G.est[p][officeEst]++;
  G.doOffice = false;
  log(G, `\ttrade ${est_names[officeEst]} for ${est_names[est]} with #${p}`);
  switchState(G, ctx);
  return;
}

/**
 * End the turn.
 * @param G 
 * @param ctx
 */
const endTurn: Move<MachikoroG> = (G, ctx) => {
  if (!canEndTurn(G)) return INVALID_MOVE;

  const player = parseInt(ctx.currentPlayer);
  if (G.state === "buy" && G.land[player][6]) 
    earn(G, {to: player, amount: 10}); // airport
  if (G.secondTurn)
    ctx.events!.endTurn({next: player.toString()}); // amusement park
  else
    ctx.events!.endTurn();
  return;
}

// --- Helpers ----------------------------------------------------------------

/**
 * Evaluate the outcome of the roll.
 * @param G
 * @param ctx
 */
const commitRoll = (G: MachikoroG, ctx: Ctx): void => {
  // Note: this is no longer a player move, and should only be called internally.
  // get list of players in forward/backward order. Forward order includes
  // current player, backward order excludes current player.
  const forwards = getNextPlayers(G, ctx);
  const backwards = getPreviousPlayers(G, ctx);
  const player = parseInt(ctx.currentPlayer);

  switch (G.roll) {
    case 1:
      backwards.forEach( (p) => {
        if (G.land[p][5]) take(G, {from: player, to: p, amount: (G.land[p][1] ? 4 : 3)*G.est[p][15]}); // sushi bar
      }); 
      forwards.forEach( (p) => earn(G, {to: p, amount: 1*G.est[p][0]})); // wheat field
      break;
    case 2:
      forwards.forEach( (p) => {
        let amount = 1*G.est[p][1]; // livestock farm
        if (p === player) amount += (G.land[player][1] ? 2 : 1)*G.est[player][2]; // bakery
        earn(G, {to: p, amount});
      });
      break;
    case 3:
      backwards.forEach( (p) => take(G, {from: player, to: p, amount: (G.land[p][1] ? 2 : 1)*G.est[p][3]})); // cafe
      earn(G, {to: player, amount: (G.land[player][1] ? 2 : 1)*G.est[player][2]}); // bakery
      break;
    case 4:
      forwards.forEach( (p) => {
        let amount = 1*G.est[p][16]; // flower orchard
        if (p === player) amount += (G.land[player][1] ? 4 : 3)*G.est[player][4]; // convenience store
        earn(G, {to: p, amount});
      });
      break;
    case 5:
      forwards.forEach( (p) => earn(G, {to: p, amount: 1*G.est[p][5]})); // forest
      break;
    case 6:
      earn(G, {to: player, amount: (G.land[player][1] ? 2 : 1)*G.est[player][17]*G.est[player][16]}); // flower shop
      if (G.est[player][6] > 0) backwards.forEach( (p) => take(G, {from: p, to: player, amount: 2})); // stadium
      if (G.est[player][7] > 0) G.doTV = true; // TV station
      if (G.est[player][8] > 0) G.doOffice = true; // office
      break;
    case 7:
      backwards.forEach( (p) => take(G, {from: player, to: p, amount: (G.land[p][1] ? 2 : 1)*G.est[p][18]})); // pizza joint
      earn(G, {to: player, amount: 3*G.est[player][9]*countAnimal(G, player)}); // cheese factory
      if (G.est[player][19] > 0) 
        backwards.forEach( (p) => take(G, {from: p, to: player, amount: countCup(G, p)+countHouse(G, p)})); // publisher
      break;
    case 8:
      backwards.forEach( (p) => take(G, {from: player, to: p, amount: (G.land[p][1] ? 2 : 1)*G.est[p][21]})); // hamburger stand
      forwards.forEach( (p) => {
        let amount = (G.land[p][5] ? 3 : 0)*G.est[p][20]; // mackerel boat
        if (p === player) amount += 3*G.est[player][10]*countGear(G, player); // furniture factory
        earn(G, {to: p, amount});
      });
      if (G.est[player][22] > 0) backwards.forEach( (p) => {
        if (G.money[p] >= 10) take(G, {from: p, to: player, amount: Math.floor(G.money[p]/2)}); // tax office
      });
      break;
    case 9:
      backwards.forEach( (p) => take(G, {from: player, to: p, amount: (G.land[p][1] ? 3 : 2)*G.est[p][12]})); // restaurant
      forwards.forEach( (p) => earn(G, {to: p, amount: 5*G.est[p][11]})); // mine
      if (G.est[player][22] > 0) backwards.forEach( (p) => {
        if (G.money[p] >= 10) take(G, {from: p, to: player, amount: Math.floor(G.money[p]/2)}); // tax office
      });
      break;
    case 10:
      backwards.forEach( (p) => take(G, {from: player, to: p, amount: (G.land[p][1] ? 3 : 2)*G.est[p][12]})); // restaurant
      forwards.forEach( (p) => earn(G, {to: p, amount: 3*G.est[p][13]})); // apple orchard
      break;
    case 11:
    case 12:
    case 13:
    case 14:
      let doTunaRoll = [12, 13, 14].includes(G.roll) && forwards.some( (p) => G.land[p][5] && G.est[p][23] );
      let tunaRoll: number;
      if (doTunaRoll) {
        // one roll for all players
        tunaRoll = ctx.random!.Die(6, 2).reduce( (a, b) => a+b );
        log(G, `\t(tuna boat roll: ${tunaRoll})`);
      }
      forwards.forEach( (p) => {
        let amount = 0;
        if (doTunaRoll && G.land[p][5] && G.est[p][23] > 0)
          amount += tunaRoll*G.est[p][23]; // tuna boat
        if ([11, 12].includes(G.roll) && p === player) 
          amount += 2*G.est[player][14]*countPlant(G, player); // produce market
        if ([12, 13].includes(G.roll) && p === player)
          amount += 2*G.est[player][24]*countCup(G, player); // food warehouse
        earn(G, {to: p, amount});
      });
      break;
  }
  switchState(G, ctx);
}

/**
 * Return the next players (including self) in the order that the Blue 
 * establishments are evaluated.
 * @param G 
 * @param ctx 
 * @returns Array of player IDs.
 */
const getNextPlayers = (G: MachikoroG, ctx: Ctx): number[] => {
  let current = ctx.playOrderPos;
  let N = ctx.numPlayers;
  let forwards: number[] = [];
  for (let i = 0; i < N; i++) {
    let shifted_i = (current + i) % N;
    forwards.push(parseInt(G.turn_order[shifted_i]));
  }
  return forwards;
}

/**
 * Return the previous players (excluding self) in the order that the Red
 * establishments are evaluated.
 * @param G 
 * @param ctx 
 * @returns Array of player IDs.
 */
 const getPreviousPlayers = (G: MachikoroG, ctx: Ctx): number[] => {
  let current = ctx.playOrderPos;
  let N = ctx.numPlayers;
  let backwards: number[] = []; 
  for (let i = 1; i < N; i++)  {
    let shifted_i = ((current - i) % N + N) % N; // JS modulo is negative
    backwards.push(parseInt(G.turn_order[shifted_i])); 
  }
  return backwards;
}

/**
 * @param G 
 * @param body - `to` receives `amount` coins from the bank.
 */
const earn = (G: MachikoroG, body: {to: number, amount: number}): void => {
  const { to, amount } = body;
  if (amount > 0) {
    G.money[to] += amount;
    log(G, `\t#${to} earns ${amount} $`);
  }
}

/**
 * @param G 
 * @param body - `from` gives `amount` coins to `to`.
 */
const take = (G: MachikoroG, body: {from: number, to: number, amount: number}): void => {
  const { from, to, amount } = body;
  const max = Math.min(amount, G.money[from]);
  if (max > 0) {
    G.money[from] -= max;
    G.money[to] += max;
    log(G, `\t#${from} pays #${to} ${max} $`);
  }
}

/**
 * @param G 
 * @param player
 * @returns Number of cup-type establishments owned by player `player`.
 */
const countCup = (G: MachikoroG, player: number): number => {
  const ests = G.est[player];
  return ests[3] + ests[12] + ests[15] + ests[18] + ests[21];
}

/**
 * @param G 
 * @param player
 * @returns Number of house-type establishments owned by `player`.
 */
const countHouse = (G: MachikoroG, player: number): number => {
  const ests = G.est[player];
  return ests[2] + ests[4] + ests[17];
}

/**
 * @param G 
 * @param player
 * @returns Number of animal-type establishments owned by `player`.
 */
const countAnimal = (G: MachikoroG, player: number): number => {
  const ests = G.est[player];
  return ests[1];
}

/**
 * @param G 
 * @param player
 * @returns Number of gear-type establishments owned by `player`.
 */
const countGear = (G: MachikoroG, player: number): number => {
  const ests = G.est[player];
  return ests[5] + ests[11];
}

/**
 * @param G 
 * @param player
 * @returns Number of wheat-type establishments owned by `player`.
 */
const countPlant = (G: MachikoroG, player: number): number => {
  const ests = G.est[player];
  return ests[0] + ests[13] + ests[16];
}

/**
 * To be run after the roll is commited. Checks if any Purple (major) 
 * establishments need to be performed, and changes the game state accordingly.
 * @param G
 * @param ctx
 */
const switchState = (G: MachikoroG, ctx: Ctx): void => {
  const player = parseInt(ctx.currentPlayer);
  if (G.doTV) {
    G.state = "tv";
  } else if (G.doOffice) {
    G.state = "office1";
  } else {
    // city hall: if zero coins, get one coin.
    if (G.land[player][4] && G.money[player] === 0) {
      log(G, `\t#${player} earns 1 $ (city hall)`);
      G.money[player] = 1;
    }
    G.state = "buy";
  }
}

/**
 * End the game.
 * @param G 
 * @param ctx 
 * @param winner - ID of the winning player.
 */
const endGame = (G: MachikoroG, ctx: Ctx, winner: number): void => {
  log(G, `Game over. Winner: #${winner}`);
  ctx.events!.endGame();
}

/**
 * Add entry to the log.
 */
const log = (G: MachikoroG, msg: string): void => {
  G.log.push({id: G.log_i, msg});
  G.log_i++;
  while (G.log.length > 200) {
    G.log.shift();
  }
}

/**
 * Set up establishment supply at start of game.
 */
const setupSupply = (G: MachikoroG, ctx: Ctx, supplyVariant: string): void => {
  if (supplyVariant === "total") {
    // set all supply to total
    for (let est = 0; est < G.est_use.length; est++) {
      if (G.est_use[est])
        G.est_supply[est] = G.est_total[est];
    }
  } else if (supplyVariant === "variable") {
    // fill deck with establishments and shuffle
    for (let est = 0; est < G.est_use.length; est++) {
      if (G.est_use[est])
        G.secret = G.secret.concat(Array(G.est_total[est]).fill(est));
    }
    G.secret = ctx.random!.Shuffle(G.secret);
  } else if (supplyVariant === "hybrid") {
    // fill all three decks and shuffle
    const deckList = [deck1, deck2, deck3];
    for (let i = 0; i <= 2; i++) {
      let deck: number[] = [];
      for (let est of deckList[i]) {
        if (G.est_use[est])
          deck = deck.concat(Array(G.est_total[est]).fill(est));
      }
      deck = ctx.random!.Shuffle(deck);
      G.secret.push(deck);
    }
  }
}

/**
 * Replenish establishments at start of each turn.
 */
const replenishSupply = (G: MachikoroG): void => {
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

// --- Game -------------------------------------------------------------------

// set-up to use in debug mode
const debugSetupData = {
  expansion: "harbor",
  supplyVariant: "total",
  startCoins: 99,
  randomizeTurnOrder: false,
};

export const Machikoro: Game<MachikoroG> = {

  name: GAME_NAME,

  // `setupData` is set in src/lobby/Lobby.js
  setup: (ctx, setupData?) => {
    if (!setupData) setupData = debugSetupData;
    const { expansion, supplyVariant, startCoins, randomizeTurnOrder } = setupData;

    const n = ctx.numPlayers;
    const G: MachikoroG = {
      state: 'roll',
      roll: 0,
      numRolls: 0,
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
      est: Array(n).fill([]),
      land: Array(n).fill([]),
      est_use: [],
      land_use: [],
      secret: [],
      supplyVariant,
    };
    // shuffle play order?
    if (randomizeTurnOrder) 
      G.turn_order = ctx.random!.Shuffle(G.turn_order);
    // starting establishments
    for (let p = 0; p < n; p++) {
      G.est[p] = [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // each player's establishments
                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      G.land[p] = Array(7).fill(false); // each player's landmarks
    }
    // expansion
    if (expansion === "base") {
      G.est_use = Array(15).fill(true).concat(Array(10).fill(false)); // use establishment in this game?
      G.land_use = Array(4).fill(true).concat(Array(3).fill(false)); // use landmark in this game?
    } else if (expansion === "harbor") {
      G.est_use = Array(25).fill(true);
      G.land_use = Array(7).fill(true);
      for (let p = 0; p < n; p++) {
        G.land[p][4] = true; // each player starts with city hall
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
      if (!["base", "harbor"].includes(expansion)) return 'expansion not valid';
      if (!["total", "variable", "hybrid"].includes(supplyVariant)) return 'supply variant not valid';
      if (!Number.isInteger(startCoins)) return 'number of starting coins not integer'; 
    }
    if (numPlayers < 2) return 'too few players';
    if (numPlayers > 5) return 'too many players';
    return;
  },

  turn: {
    onBegin: (G, ctx) => {
      replenishSupply(G);
      G.state = "roll";
      G.roll = 0;
      G.numRolls = 0;
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
    keepRoll: {
      move: keepRoll,
      undoable: false,
    },
    addTwo: {
      move: addTwo,
      undoable: false,
    },
    buyEst: buyEst,
    buyLand: buyLand,
    doTV: doTV,
    doOfficePhase1: doOfficePhase1,
    doOfficePhase2: doOfficePhase2,
    endTurn: endTurn,
  },

  playerView: PlayerView.STRIP_SECRETS,
  
};
