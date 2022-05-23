import { Ctx, Game, Move } from 'boardgame.io';
import { INVALID_MOVE, PlayerView, TurnOrder } from 'boardgame.io/core';

import * as Est from './establishments';
import * as Land from './landmarks';
import * as Log from './log';
import { CardType, Color, Expansion, State, SupplyVariant } from './enums';
import type { Establishment, Landmark, MachikoroG } from './types';

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

export const GAME_NAME = 'machikoro';

// --- Queries ----------------------------------------------------------------
// These functions are used to internally to check whether a move is legal or
// not, and externally for the client to render things correctly.

/**
 * @param G
 * @param ctx
 * @param n Number of dice to roll.
 * @returns True if the current player can roll `n` number of dice.
 */
export const canRoll = (G: MachikoroG, ctx: Ctx, n: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === State.Roll &&
    (n === 1 || (n === 2 && Land.isOwned(G.land_data, player, Land.TrainStation))) &&
    (G.numRolls === 0 || (G.numRolls === 1 && Land.isOwned(G.land_data, player, Land.RadioTower)))
  );
};

/**
 * @param G
 * @returns True if the current player has rolled the dice and can proceed
 *  to evaluate its outcome.
 */
export const canCommitRoll = (G: MachikoroG): boolean => {
  return G.state === State.Roll && G.numRolls > 0;
};

/**
 * @param G
 * @param ctx
 * @returns True if the current player can activate Harbor.
 */
export const canAddTwo = (G: MachikoroG, ctx: Ctx): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return canCommitRoll(G) && Land.isOwned(G.land_data, player, Land.Harbor) && G.roll >= 10;
};

/**
 * @param G
 * @param ctx
 * @returns True if the current player cannot roll the dice or activate Harbor.
 */
export const canSkipConfirmation = (G: MachikoroG, ctx: Ctx): boolean => {
  return !(canAddTwo(G, ctx) || canRoll(G, ctx, 1) || canRoll(G, ctx, 2));
};

/**
 * @param G
 * @param ctx
 * @param est Establishment to buy.
 * @returns True if the current player can buy the establishment `est`.
 */
export const canBuyEst = (G: MachikoroG, ctx: Ctx, est: Establishment): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === State.Buy &&
    Est.isInUse(G.est_data, est) &&
    Est.countAvailable(G.est_data, est) > 0 &&
    G.money[player] >= est.cost &&
    (est.color === Color.Purple ? Est.countOwned(G.est_data, player, est) === 0 : true) // only own unique purples
  );
};

/**
 * @param G
 * @param ctx
 * @param land Landmark to buy.
 * @returns True if the current player can buy the landmark `land`.
 */
export const canBuyLand = (G: MachikoroG, ctx: Ctx, land: Landmark): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === State.Buy &&
    Land.isInUse(G.land_data, land) &&
    !Land.isOwned(G.land_data, player, land) &&
    G.money[player] >= land.cost
  );
};

/**
 * @param G
 * @param ctx
 * @param opponent Player to take money from.
 * @returns True if the current player can take money from the player, as a TV
 *  action.
 */
export const canDoTV = (G: MachikoroG, ctx: Ctx, opponent: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return G.state === State.TV && opponent !== player;
};

/**
 * @param G
 * @param ctx
 * @param est Establishment the current player owns to give up.
 * @returns True if the current player can pick `est` as the establishment to
 *  give up, as the first phase of the office action.
 */
export const canDoOfficePhase1 = (G: MachikoroG, ctx: Ctx, est: Establishment): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return G.state === State.OfficePhase1 && Est.countOwned(G.est_data, player, est) > 0 && est.color !== Color.Purple;
};

/**
 * @param G
 * @param ctx
 * @param opponent Player to take an establishment from.
 * @param est Establishment to take.
 * @returns True if the current player can take a player's establishment, as
 *  the second phase of the office action.
 */
export const canDoOfficePhase2 = (G: MachikoroG, ctx: Ctx, opponent: number, est: Establishment): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.state === State.OfficePhase2 &&
    opponent !== player &&
    Est.countOwned(G.est_data, opponent, est) > 0 &&
    est.color !== Color.Purple
  );
};

/**
 * @param G
 * @returns True if the current player can end their turn.
 */
export const canEndTurn = (G: MachikoroG): boolean => {
  return G.state === State.Buy || G.state === State.End;
};

/**
 * @param G
 * @param ctx
 * @returns True if the current player has won the game.
 */
export const canEndGame = (G: MachikoroG, ctx: Ctx): boolean => {
  const player = parseInt(ctx.currentPlayer);
  for (const land of Land.getAllInUse(G.land_data)) if (!Land.isOwned(G.land_data, player, land)) return false;
  return true;
};

// --- Moves ------------------------------------------------------------------
// These are moves the player can make, and are called in the `Game` object.

/**
 * Roll one die.
 * @param G
 * @param ctx
 */
const rollOne: Move<MachikoroG> = (G, ctx) => {
  if (!canRoll(G, ctx, 1)) return INVALID_MOVE;
  G.log_buffer = [];

  G.roll = ctx.random!.Die(6);
  G.numRolls++;
  G.log_buffer.push(Log.rollOne(G.roll));
  if (canSkipConfirmation(G, ctx)) commitRoll(G, ctx);

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Roll two dice.
 * @param G
 * @param ctx
 */
const rollTwo: Move<MachikoroG> = (G, ctx) => {
  if (!canRoll(G, ctx, 2)) return INVALID_MOVE;
  G.log_buffer = [];

  const player = parseInt(ctx.currentPlayer);
  const dice = ctx.random!.Die(6, 2);
  if (Land.isOwned(G.land_data, player, Land.AmusementPark)) G.secondTurn = dice[0] === dice[1];
  G.roll = dice[0] + dice[1];
  G.numRolls++;
  G.log_buffer.push(Log.rollTwo(dice));
  if (canSkipConfirmation(G, ctx)) commitRoll(G, ctx);

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Force roll outcome; this move is removed in production.
 * @param G
 * @param ctx
 * @param roll Forced outcome of the dice.
 */
const debugRoll: Move<MachikoroG> = (G, ctx, roll: number) => {
  G.log_buffer = [];

  G.roll = roll;
  G.numRolls++;
  G.log_buffer.push(Log.rollOne(roll));
  if (canSkipConfirmation(G, ctx)) commitRoll(G, ctx);

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Do not activate Harbor and keep the current roll.
 * @param G
 * @param ctx
 */
const keepRoll: Move<MachikoroG> = (G, ctx) => {
  if (!canCommitRoll(G)) return INVALID_MOVE;
  G.log_buffer = [];

  commitRoll(G, ctx);

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Activate Harbor and add 2 to the current roll.
 * @param G
 * @param ctx
 */
const addTwo: Move<MachikoroG> = (G, ctx) => {
  if (!canAddTwo(G, ctx)) return INVALID_MOVE;
  G.log_buffer = [];

  G.roll += 2;
  G.log_buffer.push(Log.addTwo(G.roll));
  commitRoll(G, ctx);

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Buy an establishment.
 * @param G
 * @param ctx
 * @param est Establishment to buy.
 */
const buyEst: Move<MachikoroG> = (G, ctx, est: Establishment) => {
  if (!canBuyEst(G, ctx, est)) return INVALID_MOVE;
  G.log_buffer = [];

  const player = parseInt(ctx.currentPlayer);
  Est.buy(G.est_data, player, est);
  G.money[player] -= est.cost;
  G.state = State.End;
  G.justBoughtEst = est;
  G.log_buffer.push(Log.buy(est.name));

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Buy a landmark.
 * @param G
 * @param ctx
 * @param land Landmark to buy.
 */
const buyLand: Move<MachikoroG> = (G, ctx, land: Landmark) => {
  if (!canBuyLand(G, ctx, land)) return INVALID_MOVE;
  G.log_buffer = [];

  const player = parseInt(ctx.currentPlayer);
  Land.buy(G.land_data, player, land);
  G.money[player] -= land.cost;
  G.state = State.End;
  G.log_buffer.push(Log.buy(land.name));
  if (canEndGame(G, ctx)) endGame(G, ctx, player);

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Activate the TV establishment.
 * @param G
 * @param ctx
 * @param opponent Player to take money from.
 */
const doTV: Move<MachikoroG> = (G, ctx, opponent: number) => {
  if (!canDoTV(G, ctx, opponent)) return INVALID_MOVE;
  G.log_buffer = [];

  const player = parseInt(ctx.currentPlayer);
  take(G, { from: opponent, to: player, amount: 5 }, Est.TVStation.name);
  G.doTV = false;
  switchState(G, ctx);

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Activate the office establishment. For the first phase, pick an
 * establishment you own to give up.
 * @param G
 * @param ctx
 * @param est Establishment you own to give up.
 */
const doOfficePhase1: Move<MachikoroG> = (G, ctx, est: Establishment) => {
  if (!canDoOfficePhase1(G, ctx, est)) return INVALID_MOVE;
  G.log_buffer = [];

  G.officeEst = est;
  G.state = State.OfficePhase2;

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * Activate the office establishment. For the second phase, pick an
 * establishment an opponent owns to take.
 * @param G
 * @param ctx
 * @param opponent Player to take an establishment from.
 * @param est Establishment to take.
 */
const doOfficePhase2: Move<MachikoroG> = (G, ctx, opponent: number, est: Establishment) => {
  if (!canDoOfficePhase2(G, ctx, opponent, est)) return INVALID_MOVE;
  G.log_buffer = [];

  const player = parseInt(ctx.currentPlayer);
  if (G.officeEst) {
    Est.transfer(G.est_data, { from: player, to: opponent, est: G.officeEst });
    Est.transfer(G.est_data, { from: opponent, to: player, est: est });
    G.doOffice = false;
    G.log_buffer.push(Log.office({ player_est_name: G.officeEst.name, opponent_est_name: est.name }, opponent));
  } else {
    throw Error('Unexpected error: `G.officeEst` is not set.');
  }
  switchState(G, ctx);

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

/**
 * End the turn.
 * @param G
 * @param ctx
 */
const endTurn: Move<MachikoroG> = (G, ctx) => {
  if (!canEndTurn(G)) return INVALID_MOVE;
  G.log_buffer = [];

  const player = parseInt(ctx.currentPlayer);
  if (G.state === State.Buy && Land.isOwned(G.land_data, player, Land.Airport))
    earn(G, { to: player, amount: 10 }, Land.Airport.name);
  if (G.secondTurn) ctx.events!.endTurn({ next: player.toString() });
  else ctx.events!.endTurn();

  ctx.log?.setMetadata(G.log_buffer);
  return;
};

// --- Helpers ----------------------------------------------------------------

/**
 * Evaluate the outcome of the roll by performing establishment actions.
 * @param G
 * @param ctx
 */
const commitRoll = (G: MachikoroG, ctx: Ctx): void => {
  const currentPlayer = parseInt(ctx.currentPlayer);

  // Do Red establishments.
  let ests = Est.getAllInUse(G.est_data).filter((est) => est.color === Color.Red && est.activation.includes(G.roll));
  for (const opponent of getPreviousPlayers(ctx)) {
    for (const est of ests) {
      // normal: Cafe, Restaurant, PizzaJoint, HamburgerStand
      // special: SushiBar
      if (Est.isEqual(est, Est.SushiBar) && !Land.isOwned(G.land_data, opponent, Land.Harbor)) continue;

      const count = Est.countOwned(G.est_data, opponent, est);
      if (count === 0) continue;

      let base = est.base;
      if (est.type === CardType.Cup && Land.isOwned(G.land_data, opponent, Land.ShoppingMall)) base += 1;

      take(G, { from: currentPlayer, to: opponent, amount: base * count }, est.name);
    }
  }

  // Do Blue establishments.
  ests = Est.getAllInUse(G.est_data).filter((est) => est.color === Color.Blue && est.activation.includes(G.roll));
  for (const player of getNextPlayers(ctx)) {
    for (const est of ests) {
      // normal: WheatField, LivestockFarm, Forest, Mine, AppleOrchard, FlowerOrchard,
      // special: MackerelBoat, TunaBoat
      if (
        (Est.isEqual(est, Est.MackerelBoat) || Est.isEqual(est, Est.TunaBoat)) &&
        !Land.isOwned(G.land_data, player, Land.Harbor)
      )
        continue;

      const count = Est.countOwned(G.est_data, player, est);
      if (count === 0) continue;

      let base = est.base;
      if (Est.isEqual(est, Est.TunaBoat)) base = getTunaRoll(G, ctx);

      earn(G, { to: player, amount: base * count }, est.name);
    }
  }

  // Do Green establishments.
  ests = Est.getAllInUse(G.est_data).filter((est) => est.color === Color.Green && est.activation.includes(G.roll));
  for (const est of ests) {
    // normal: Bakery, ConvenienceStore
    // special: CheeseFactory, FurnitureFactory, ProduceMarket, FlowerShop, FoodWarehouse
    const count = Est.countOwned(G.est_data, currentPlayer, est);
    if (count === 0) continue;

    let base = est.base;
    if (est.type === CardType.Shop && Land.isOwned(G.land_data, currentPlayer, Land.ShoppingMall)) base += 1;

    let multiplier = 1;
    if (Est.isEqual(est, Est.CheeseFactory))
      multiplier = Est.countTypeOwned(G.est_data, currentPlayer, CardType.Animal);
    else if (Est.isEqual(est, Est.FurnitureFactory))
      multiplier = Est.countTypeOwned(G.est_data, currentPlayer, CardType.Gear);
    else if (Est.isEqual(est, Est.ProduceMarket))
      multiplier = Est.countTypeOwned(G.est_data, currentPlayer, CardType.Wheat);
    else if (Est.isEqual(est, Est.FlowerShop))
      multiplier = Est.countOwned(G.est_data, currentPlayer, Est.FlowerOrchard);
    else if (Est.isEqual(est, Est.FoodWarehouse))
      multiplier = Est.countTypeOwned(G.est_data, currentPlayer, CardType.Cup);

    earn(G, { to: currentPlayer, amount: base * multiplier * count }, est.name);
  }

  // Do Purple establishments.
  ests = Est.getAllInUse(G.est_data).filter((est) => est.color === Color.Purple && est.activation.includes(G.roll));
  for (const est of ests) {
    // normal: -
    // special: Stadium, TVStation, Office, Publisher, TaxOffice
    if (Est.countOwned(G.est_data, currentPlayer, est) === 0) continue;

    if (Est.isEqual(est, Est.Stadium))
      for (const opponent of getPreviousPlayers(ctx))
        take(G, { from: opponent, to: currentPlayer, amount: est.base }, est.name);
    else if (Est.isEqual(est, Est.TVStation)) G.doTV = true;
    else if (Est.isEqual(est, Est.Office)) G.doOffice = true;
    else if (Est.isEqual(est, Est.Publisher))
      for (const opponent of getPreviousPlayers(ctx)) {
        const count =
          Est.countTypeOwned(G.est_data, opponent, CardType.Cup) +
          Est.countTypeOwned(G.est_data, opponent, CardType.Shop);
        take(
          G,
          {
            from: opponent,
            to: currentPlayer,
            amount: est.base * count,
          },
          est.name
        );
      }
    else if (Est.isEqual(est, Est.TaxOffice))
      for (const opponent of getPreviousPlayers(ctx))
        if (G.money[opponent] >= Est.TAX_OFFICE_THRESHOLD)
          take(
            G,
            {
              from: opponent,
              to: currentPlayer,
              amount: Math.floor(G.money[opponent] / 2),
            },
            est.name
          );
  }

  switchState(G, ctx);
};

/**
 * Return the next players (including self) in the order that the Blue
 * establishments are evaluated.
 * @param ctx
 * @returns Array of player IDs.
 */
const getNextPlayers = (ctx: Ctx): number[] => {
  const current = ctx.playOrderPos;
  const N = ctx.numPlayers;
  const forwards: number[] = [];
  for (let i = 0; i < N; i++) {
    const shifted_i = (current + i) % N;
    forwards.push(parseInt(ctx.playOrder[shifted_i]));
  }
  return forwards;
};

/**
 * Return the previous players (excluding self) in the order that the Red
 * establishments are evaluated.
 * @param ctx
 * @returns Array of player IDs.
 */
const getPreviousPlayers = (ctx: Ctx): number[] => {
  const current = ctx.playOrderPos;
  const N = ctx.numPlayers;
  const backwards: number[] = [];
  for (let i = 1; i < N; i++) {
    const shifted_i = (((current - i) % N) + N) % N; // JS modulo is negative
    backwards.push(parseInt(ctx.playOrder[shifted_i]));
  }
  return backwards;
};

/**
 * @param G
 * @param obj `to` receives `amount` coins from the bank.
 * @param name Name of establishment or landmark activated.
 */
const earn = (G: MachikoroG, obj: { to: number; amount: number }, name: string): void => {
  const { to, amount } = obj;
  G.money[to] += amount;
  if (amount > 0) G.log_buffer.push(Log.earn(obj, name));
};

/**
 * @param G
 * @param obj `from` gives `amount` coins to `to`, or as much as possible.
 * @param name Name of establishment or landmark activated.
 */
const take = (G: MachikoroG, obj: { from: number; to: number; amount: number }, name: string): void => {
  const { from, to, amount } = obj;
  const min = Math.min(amount, G.money[from]);
  G.money[from] -= min;
  G.money[to] += min;
  obj.amount = min; // so that log shows correct amount exchanged
  if (min > 0) G.log_buffer.push(Log.take(obj, name));
};

/**
 * Make a roll for the tuna boat, if not done yet for this turn.
 * @param G
 * @param ctx
 * @returns Dice roll.
 */
const getTunaRoll = (G: MachikoroG, ctx: Ctx): number => {
  if (!G.tunaRoll) {
    const dice = ctx.random!.Die(6, 2);
    G.tunaRoll = dice[0] + dice[1];
    G.log_buffer.push(Log.tunaRoll(G.tunaRoll));
  }
  return G.tunaRoll;
};

/**
 * To be run after the roll is commited. Checks if any Purple establishment
 * needs to be performed, and changes the game state accordingly.
 * @param G
 * @param ctx
 */
const switchState = (G: MachikoroG, ctx: Ctx): void => {
  const player = parseInt(ctx.currentPlayer);
  if (G.doTV) G.state = State.TV;
  else if (G.doOffice) G.state = State.OfficePhase1;
  else {
    if (G.money[player] === 0) {
      G.money[player]++;
      G.log_buffer.push(Log.earn({ to: player, amount: 1 }, 'City Hall'));
    }
    G.state = State.Buy;
  }
};

/**
 * End the game.
 * @param G
 * @param ctx
 * @param winner ID of the winning player.
 */
const endGame = (G: MachikoroG, ctx: Ctx, winner: number): void => {
  G.log_buffer.push(Log.endGame(winner));
  ctx.events!.endGame();
};

// --- Game -------------------------------------------------------------------

// set-up to use in debug mode
const debugSetupData = {
  expansion: Expansion.Harbor,
  supplyVariant: SupplyVariant.Total,
  startCoins: 99,
  randomizeTurnOrder: false,
};

// properties of G for a new turn
const newTurnG = {
  state: State.Roll,
  roll: 0,
  numRolls: 0,
  secondTurn: false,
  doTV: false,
  doOffice: false,
  officeEst: null,
  tunaRoll: null,
  justBoughtEst: null,
};

export const Machikoro: Game<MachikoroG> = {
  name: GAME_NAME,

  // `setupData` is set in src/lobby/Lobby.js
  setup: (ctx, setupData?) => {
    if (!setupData) setupData = debugSetupData;
    const { expansion, supplyVariant, startCoins, randomizeTurnOrder } = setupData;
    const { numPlayers } = ctx;
    const { data: est_data, decks } = Est.initialize(expansion, supplyVariant, numPlayers);
    const land_data = Land.initialize(expansion, numPlayers);

    // initial coins
    const money = Array(numPlayers).fill(startCoins);

    // shuffle deck and play order
    for (let i = 0; i < decks.length; i++) decks[i] = ctx.random!.Shuffle(decks[i]);
    let _playOrder = [...Array(numPlayers).keys()].map((x) => x.toString());
    if (randomizeTurnOrder) _playOrder = ctx.random!.Shuffle(_playOrder);

    const G: MachikoroG = {
      ...newTurnG,
      money,
      est_data,
      land_data,
      supplyVariant,
      _playOrder,
      secret: { decks },
      log_buffer: [],
    };
    Est.replenishSupply(G);
    return G;
  },

  validateSetupData: (setupData, numPlayers) => {
    if (setupData) {
      const { expansion, supplyVariant, startCoins } = setupData;
      if (!Object.values(Expansion).includes(expansion)) return `Unknown expansion: ${expansion}`;
      if (!Object.values(SupplyVariant).includes(supplyVariant)) return `Unknown supply variant: ${supplyVariant}`;
      if (!Number.isInteger(startCoins)) return `Number of starting coins, ${startCoins}, must be an integer`;
    }
    if (!(Number.isInteger(numPlayers) && numPlayers >= 2 && numPlayers <= 5))
      return `Number of players, ${numPlayers}, must be an integer between 2 to 5.`;
    return;
  },

  turn: {
    onBegin: (G) => {
      Est.replenishSupply(G);
      Object.assign(G, newTurnG);
    },
    order: TurnOrder.CUSTOM_FROM('_playOrder'),
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
