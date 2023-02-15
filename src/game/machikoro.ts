//
// Implementation of Machikoro board game.
//

import { Ctx, Game, Move } from 'boardgame.io';
import { INVALID_MOVE, PlayerView, TurnOrder } from 'boardgame.io/core';
import { FnContext } from 'boardgame.io/dist/types/src/types';

import * as Est from './establishments';
import * as Land from './landmarks';
import * as Log from './log';
import { EstColor, EstType, Establishment } from './establishments';
import { Expansion, MachikoroG, SetupData, SupplyVariant, TurnState } from './types';
import { Landmark } from './landmarks';

export const GAME_NAME = 'machikoro';

//
// === Queries ===
//
// These functions do not modify `G` and are exported for use in the client.
//

/**
 * @param G
 * @param player
 * @returns The number of coins owned by the player.
 */
export const getCoins = (G: MachikoroG, player: number): number => {
  return G._coins[player];
};

/**
 * @param G
 * @param ctx
 * @param n - Number of dice to roll.
 * @returns True if the current player can roll `n` number of dice.
 */
export const canRoll = (G: MachikoroG, ctx: Ctx, n: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.turnState === TurnState.Roll &&
    // can always roll 1 die, can roll 2 if you own train station
    (n === 1 || (n === 2 && Land.owns(G, player, Land.TrainStation))) &&
    // can reroll if you own radio tower
    (G.numRolls === 0 || (G.numRolls === 1 && Land.owns(G, player, Land.RadioTower)))
  );
};

/**
 * @param G
 * @returns True if the current player has rolled the dice and can proceed
 * to evaluate its outcome.
 */
export const canCommitRoll = (G: MachikoroG): boolean => {
  // need to have rolled the dice
  return G.turnState === TurnState.Roll && G.numRolls > 0;
};

/**
 * @param G
 * @param ctx
 * @returns True if the current player can activate Harbor.
 */
export const canAddTwo = (G: MachikoroG, ctx: Ctx): boolean => {
  const player = parseInt(ctx.currentPlayer);
  // need to own harbor and roll a 10 or higher
  return canCommitRoll(G) && Land.owns(G, player, Land.Harbor) && G.roll! >= 10; // G.roll not null via canCommitRoll() check
};

/**
 * @param G
 * @param ctx
 * @returns True if the current player cannot modify the dice roll any further.
 */
export const noFurtherRollActions = (G: MachikoroG, ctx: Ctx): boolean => {
  return !(canAddTwo(G, ctx) || canRoll(G, ctx, 1) || canRoll(G, ctx, 2));
};

/**
 * @param G
 * @param ctx
 * @param est
 * @returns True if the current player can buy the establishment.
 */
export const canBuyEst = (G: MachikoroG, ctx: Ctx, est: Establishment): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.turnState === TurnState.Buy &&
    // establishment is available for purchase
    Est.countAvailable(G, est) > 0 &&
    // player has enough coins
    getCoins(G, player) >= est.cost &&
    // if establishment is purple, player does not already own it
    (est.color === EstColor.Purple ? Est.countOwned(G, player, est) === 0 : true)
  );
};

/**
 * @param G
 * @param ctx
 * @param land
 * @returns True if the current player can buy the landmark.
 */
export const canBuyLand = (G: MachikoroG, ctx: Ctx, land: Landmark): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.turnState === TurnState.Buy &&
    // landmark is in use
    Land.isInUse(G, land) &&
    // player does not currently own the landmark
    !Land.owns(G, player, land) &&
    // player has enough coins
    getCoins(G, player) >= land.cost
  );
};

/**
 * @param G
 * @param ctx
 * @param opponent
 * @returns True if the current player can take coins from the opponent as a TV
 * action.
 */
export const canDoTV = (G: MachikoroG, ctx: Ctx, opponent: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  // cannot take from self
  return G.turnState === TurnState.TV && opponent !== player;
};

/**
 * @param G
 * @param ctx
 * @param est
 * @returns True if the current player can pick the establishment to give up,
 * as part of the office action.
 */
export const canDoOfficeGive = (G: MachikoroG, ctx: Ctx, est: Establishment): boolean => {
  const player = parseInt(ctx.currentPlayer);
  // must pick own establishment that is not purple
  return (
    G.turnState === TurnState.OfficeGive &&
    // must own the establishment
    Est.countOwned(G, player, est) > 0 &&
    // cannot give purple
    est.color !== EstColor.Purple
  );
};

/**
 * @param G
 * @param ctx
 * @param opponent
 * @param est
 * @returns True if the current player can take the opponent's establishment,
 * as a part of the office action.
 */
export const canDoOfficeTake = (G: MachikoroG, ctx: Ctx, opponent: number, est: Establishment): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.turnState === TurnState.OfficeTake &&
    // cannot be take from self
    opponent !== player &&
    // opponent must own the establishment
    Est.countOwned(G, opponent, est) > 0 &&
    // cannot take purple
    est.color !== EstColor.Purple
  );
};

/**
 * @param G
 * @returns True if the current player can end their turn.
 */
export const canEndTurn = (G: MachikoroG): boolean => {
  return G.turnState === TurnState.Buy || G.turnState === TurnState.End;
};

/**
 * @param G
 * @param ctx
 * @returns True if the current player has won the game.
 */
export const canEndGame = (G: MachikoroG, ctx: Ctx): boolean => {
  const player = parseInt(ctx.currentPlayer);
  // a player has won if they own all landmarks in use
  for (const land of Land.getAllInUse(G)) {
    if (!Land.owns(G, player, land)) {
      return false;
    }
  }
  return true;
};

//
// === Moves ===
//
// These functions are Moves.
//

/**
 * Roll one die.
 * @param context
 */
const rollOne: Move<MachikoroG> = (context) => {
  const { G, ctx, random } = context;
  if (!canRoll(G, ctx, 1)) {
    return INVALID_MOVE;
  }

  G.roll = random.Die(6);
  G.numRolls += 1;
  Log.logRollOne(G, G.roll);

  if (noFurtherRollActions(G, ctx)) {
    commitRoll(context);
  }

  return;
};

/**
 * Roll two dice.
 * @param context
 */
const rollTwo: Move<MachikoroG> = (context) => {
  const { G, ctx, random } = context;
  if (!canRoll(G, ctx, 2)) {
    return INVALID_MOVE;
  }

  const dice = random.Die(6, 2);

  // if player owns an amusement park, they get a second turn
  const player = parseInt(ctx.currentPlayer);
  if (Land.owns(G, player, Land.AmusementPark)) {
    G.secondTurn = dice[0] === dice[1];
  }

  G.roll = dice[0] + dice[1];
  G.numRolls += 1;
  Log.logRollTwo(G, dice);

  if (noFurtherRollActions(G, ctx)) {
    commitRoll(context);
  }

  return;
};

/**
 * Force the outcome of the dice roll. This move is removed in production.
 * @param context
 * @param roll - Desired dice total.
 */
const debugRoll: Move<MachikoroG> = (context, roll: number) => {
  const { G, ctx } = context;
  if (!canRoll(G, ctx, 1)) {
    return INVALID_MOVE;
  }

  G.roll = roll;
  G.numRolls += 1;
  Log.logRollOne(G, roll);

  if (noFurtherRollActions(G, ctx)) {
    commitRoll(context);
  }

  return;
};

/**
 * Do not activate Harbor and keep the current roll.
 * @param context
 */
const keepRoll: Move<MachikoroG> = (context) => {
  const { G } = context;
  if (!canCommitRoll(G)) {
    return INVALID_MOVE;
  }

  commitRoll(context);

  return;
};

/**
 * Activate Harbor and add 2 to the current roll.
 * @param context
 */
const addTwo: Move<MachikoroG> = (context) => {
  const { G, ctx } = context;
  if (!canAddTwo(G, ctx)) {
    return INVALID_MOVE;
  }

  G.roll! += 2; // G.roll is not null via canAddTwo() check
  Log.logAddTwo(G, G.roll!);

  commitRoll(context);

  return;
};

/**
 * Buy an establishment.
 * @param context
 * @param est
 */
const buyEst: Move<MachikoroG> = (context, est: Establishment) => {
  const { G, ctx } = context;
  if (!canBuyEst(G, ctx, est)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  Est.buy(G, player, est);
  setCoins(G, player, -est.cost);
  G.justBoughtEst = est;
  Log.logBuy(G, est.name);

  G.turnState = TurnState.End;

  return;
};

/**
 * Buy a landmark.
 * @param context
 * @param land
 */
const buyLand: Move<MachikoroG> = (context, land: Landmark) => {
  const { G, ctx } = context;
  if (!canBuyLand(G, ctx, land)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  Land.buy(G, player, land);
  setCoins(G, player, -land.cost);
  Log.logBuy(G, land.name);

  G.turnState = TurnState.End;
  if (canEndGame(G, ctx)) {
    endGame(context, player);
  }

  return;
};

/**
 * Activate the TV establishment by picking an opponent to take 5 coins from.
 * @param context
 * @param opponent
 */
const doTV: Move<MachikoroG> = (context, opponent: number) => {
  const { G, ctx } = context;
  if (!canDoTV(G, ctx, opponent)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  take(G, { from: opponent, to: player }, Est.TVStation.earnings, Est.TVStation.name);

  switchState(context);

  return;
};

/**
 * Activate the office establishment by picking an establishment you own to
 * give up.
 * @param context
 * @param est
 */
const doOfficeGive: Move<MachikoroG> = (context, est: Establishment) => {
  const { G, ctx } = context;
  if (!canDoOfficeGive(G, ctx, est)) {
    return INVALID_MOVE;
  }

  G.officeGiveEst = est;
  G.turnState = TurnState.OfficeTake;

  return;
};

/**
 * Activate the office establishment by picking an establishment an opponent
 * owns to take.
 * @param context
 * @param opponent
 * @param est
 */
const doOfficeTake: Move<MachikoroG> = (context, opponent: number, est: Establishment) => {
  const { G, ctx } = context;
  if (!canDoOfficeTake(G, ctx, opponent, est)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  if (!G.officeGiveEst) {
    throw Error('Unexpected error: `G.officeGiveEst` should be set before `doOfficeTake`.');
  }
  Est.transfer(G, { from: player, to: opponent, est: G.officeGiveEst });
  Est.transfer(G, { from: opponent, to: player, est });
  Log.logOffice(G, { player_est_name: G.officeGiveEst.name, opponent_est_name: est.name }, opponent);

  switchState(context);

  return;
};

/**
 * End the turn.
 * @param context
 */
const endTurn: Move<MachikoroG> = (context) => {
  const { G, ctx, events } = context;
  if (!canEndTurn(G)) {
    return INVALID_MOVE;
  }

  // a player earns coins via the airport if they did not buy anything
  const player = parseInt(ctx.currentPlayer);
  if (G.turnState === TurnState.Buy && Land.owns(G, player, Land.Airport)) {
    earn(G, player, Land.AIRPORT_EARNINGS, Land.Airport.name);
  }

  // check second turn
  if (G.secondTurn) {
    events.endTurn({ next: player.toString() });
  } else {
    events.endTurn();
  }

  return;
};

//
// === Move Helpers ===
//
// These functions are used by Moves, and may modify `G`.
//

/**
 * Modify a player's coins by the given amount.
 * @param G
 * @param player
 * @param amount - Number of coins to give to the player. Can be negative.
 */
const setCoins = (G: MachikoroG, player: number, amount: number): void => {
  G._coins[player] += amount;
};

/**
 * Evaluate the outcome of the roll by performing establishment actions. This
 * function controls the execution of the establishments.
 * @param context
 */
const commitRoll = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const currentPlayer = parseInt(ctx.currentPlayer);
  const roll = G.roll!;

  // Do Red establishments.
  const all_ests = Est.getAllInUse(G);
  const red_ests = all_ests.filter((est) => est.color === EstColor.Red && est.rolls.includes(roll));
  for (const opponent of getPreviousPlayers(ctx)) {
    for (const est of red_ests) {
      // sushi bar requires Harbor
      if (Est.isEqual(est, Est.SushiBar) && !Land.owns(G, opponent, Land.Harbor)) {
        continue;
      }

      const count = Est.countOwned(G, opponent, est);

      // all red establishments take `est.earnings` coins from the player
      let earnings = est.earnings;
      // +1 coin if opponent owns Shopping Mall
      if (est.type === EstType.Cup && Land.owns(G, opponent, Land.ShoppingMall)) {
        earnings += 1;
      }

      const amount = earnings * count;
      take(G, { from: currentPlayer, to: opponent }, amount, est.name);
    }
  }

  // Do Blue establishments.
  const blue_ests = all_ests.filter((est) => est.color === EstColor.Blue && est.rolls.includes(roll));
  for (const player of getNextPlayers(ctx)) {
    for (const est of blue_ests) {
      // mackerel boat and tuna boat require Harbor
      if (
        (Est.isEqual(est, Est.MackerelBoat) || Est.isEqual(est, Est.TunaBoat)) &&
        !Land.owns(G, player, Land.Harbor)
      ) {
        continue;
      }

      const count = Est.countOwned(G, player, est);
      if (count === 0) {
        continue; // avoids logging tuna boat roll when player has no tuna boats
      }

      // tuna boat earnings are based off the tuna roll
      // all other blue establishments take `est.earnings` coins from the player
      let earnings;
      if (Est.isEqual(est, Est.TunaBoat)) {
        earnings = getTunaRoll(context);
      } else {
        earnings = est.earnings;
      }

      const amount = earnings * count;
      earn(G, player, amount, est.name);
    }
  }

  // Do Green establishments.
  const green_ests = all_ests.filter((est) => est.color === EstColor.Green && est.rolls.includes(roll));
  for (const est of green_ests) {
    const count = Est.countOwned(G, currentPlayer, est);
    if (count === 0) {
      continue;
    }

    let earnings = est.earnings;
    // +1 coin to shops if player owns Shopping Mall
    if (est.type === EstType.Shop && Land.owns(G, currentPlayer, Land.ShoppingMall)) {
      earnings += 1;
    }

    // by default a green establishment earns `multiplier * earnings = 1 * earnings`
    // but there are many special cases where `multiplier` is not 1.
    let multiplier = 1;
    if (Est.isEqual(est, Est.CheeseFactory)) {
      multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Animal);
    } else if (Est.isEqual(est, Est.FurnitureFactory)) {
      multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Gear);
    } else if (Est.isEqual(est, Est.ProduceMarket)) {
      multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Wheat);
    } else if (Est.isEqual(est, Est.FlowerShop)) {
      multiplier = Est.countOwned(G, currentPlayer, Est.FlowerOrchard);
    } else if (Est.isEqual(est, Est.FoodWarehouse)) {
      multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Cup);
    }

    const amount = earnings * multiplier * count;
    earn(G, currentPlayer, amount, est.name);
  }

  // Do Purple establishments.
  const purple_ests = all_ests.filter((est) => est.color === EstColor.Purple && est.rolls.includes(roll));
  for (const est of purple_ests) {
    if (Est.countOwned(G, currentPlayer, est) === 0) {
      continue;
    }

    // each purple establishment has its own effect
    if (Est.isEqual(est, Est.Stadium)) {
      for (const opponent of getPreviousPlayers(ctx)) {
        take(G, { from: opponent, to: currentPlayer }, est.earnings, est.name);
      }
    } else if (Est.isEqual(est, Est.TVStation)) {
      G.doTV = true;
    } else if (Est.isEqual(est, Est.Office)) {
      G.doOffice = true;
    } else if (Est.isEqual(est, Est.Publisher)) {
      for (const opponent of getPreviousPlayers(ctx)) {
        const n_cups = Est.countTypeOwned(G, opponent, EstType.Cup);
        const n_shops = Est.countTypeOwned(G, opponent, EstType.Shop);
        const amount = (n_cups + n_shops) * est.earnings;
        take(G, { from: opponent, to: currentPlayer }, amount, est.name);
      }
    } else if (Est.isEqual(est, Est.TaxOffice)) {
      for (const opponent of getPreviousPlayers(ctx)) {
        const opp_coins = getCoins(G, opponent);
        if (opp_coins < Est.TAX_OFFICE_THRESHOLD) {
          continue;
        }
        const amount = Math.floor(opp_coins / 2);
        take(G, { from: opponent, to: currentPlayer }, amount, est.name);
      }
    }
  }

  // always switch state after committing role
  switchState(context);
};

/**
 * Return the next players (including self) in the order that the Blue
 * establishments are evaluated, i.e. i, i+1, i+2, ..., 0, 1, 2, ..., i-1.
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
 * establishments are evaluated, i.e. i-1, i-2, ..., 2, 1, 0, ..., i+2, i+1.
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
 * Player earns coins from the bank, and the event is logged.
 * @param G
 * @param player
 * @param amount - Number of coins. If zero, no log is created.
 * @param name - Name of establishment or landmark activated.
 */
const earn = (G: MachikoroG, player: number, amount: number, name: string): void => {
  setCoins(G, player, amount);
  if (amount > 0) {
    Log.logEarn(G, player, amount, name);
  }
};

/**
 * Player takes coins from another player, and the event is logged.
 * @param G
 * @param args.from - Coins are taken from this player
 * @param args.to - Coins are given to this player
 * @param amount - Number of coins. If zero, no log is created. Actual money
 * taken will never exceed the amount `args.from` has.
 * @param name - Name of establishment or landmark activated.
 */
const take = (G: MachikoroG, args: { from: number; to: number }, amount: number, name: string): void => {
  const { from, to } = args;
  const actual_amount = Math.min(amount, getCoins(G, from));
  setCoins(G, from, -actual_amount);
  setCoins(G, to, actual_amount);
  if (actual_amount > 0) {
    Log.logTake(G, args, actual_amount, name);
  }
};

/**
 * Get the roll for the tuna boat, logging if not done yet for this turn.
 * @param G
 * @returns Dice roll.
 */
const getTunaRoll = (context: FnContext<MachikoroG>): number => {
  const { G, random } = context;
  if (G.tunaRoll === null) {
    G.tunaRoll = random.Die(6, 2).reduce((a, b) => a + b, 0);
    Log.logTunaRoll(G, G.tunaRoll);
  }
  return G.tunaRoll;
};

/**
 * To be run after the roll is commited and after doing TV or Office. Checks if
 * TV or Office needs to be performed, and changes the game state accordingly.
 * @param context
 */
const switchState = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const player = parseInt(ctx.currentPlayer);
  if (G.doTV) {
    G.doTV = false;
    G.turnState = TurnState.TV;
  } else if (G.doOffice) {
    G.doOffice = false;
    G.turnState = TurnState.OfficeGive;
  } else {
    // city hall before buying
    // HACK: city hall is currently not treated like a regular landmark
    if (getCoins(G, player) === 0 && G.expansion === Expansion.Harbor) {
      setCoins(G, player, Land.CITY_HALL_EARNINGS);
      Log.logEarn(G, player, Land.CITY_HALL_EARNINGS, 'City Hall');
    }
    G.turnState = TurnState.Buy;
  }
};

/**
 * End the game.
 * @param context
 * @param winner - ID of the winning player.
 */
const endGame = (context: FnContext<MachikoroG>, winner: number): void => {
  const { G, events } = context;
  Log.logEndGame(G, winner);
  events.endGame();
};

//
// === Game ===
//
// Declaring the game object.
//

/**
 * Set-up data for debug mode.
 */
const debugSetupData = {
  expansion: Expansion.Harbor,
  supplyVariant: SupplyVariant.Total,
  startCoins: 99,
  randomizeTurnOrder: false,
};

/**
 * Properties of `G` to overwrite on a new turn.
 */
const newTurnG = {
  turnState: TurnState.Roll,
  roll: null,
  numRolls: 0,
  secondTurn: false,
  doTV: false,
  doOffice: false,
  officeGiveEst: null,
  justBoughtEst: null,
  tunaRoll: null,
};

export const Machikoro: Game<MachikoroG, any, SetupData> = {
  name: GAME_NAME,

  setup: ({ ctx, random }, setupData) => {
    if (!setupData) {
      setupData = debugSetupData;
    }
    const { expansion, supplyVariant, startCoins, randomizeTurnOrder } = setupData;
    const { numPlayers } = ctx;

    // initialize coins
    const _coins = Array(numPlayers).fill(startCoins);

    // initialize turn order
    let _turnOrder = [...Array(numPlayers).keys()].map((x) => x.toString());
    if (randomizeTurnOrder) {
      _turnOrder = random.Shuffle(_turnOrder);
    }

    // initialize `G` object
    const G: MachikoroG = {
      expansion,
      supplyVariant,
      _turnOrder,
      ...newTurnG,
      secret: { _decks: null },
      _coins,
      _estData: null,
      _landData: null,
      _logBuffer: null,
    };

    // initialize landmark and establishment data
    Land.initialize(G, numPlayers);
    Est.initialize(G, numPlayers);

    // shuffle decks
    const decks = G.secret._decks!;
    for (let i = 0; i < decks.length; i++) {
      decks[i] = random.Shuffle(decks[i]);
    }

    return G;
  },

  validateSetupData: (setupData, numPlayers) => {
    if (setupData) {
      const { expansion, supplyVariant, startCoins } = setupData;
      if (!Object.values(Expansion).includes(expansion)) {
        return `Unknown expansion: ${expansion}`;
      }
      if (!Object.values(SupplyVariant).includes(supplyVariant)) {
        return `Unknown supply variant: ${supplyVariant}`;
      }
      if (!Number.isInteger(startCoins) || startCoins < 0) {
        return `Number of starting coins, ${startCoins}, must be a non-negative integer`;
      }
    }
    if (!(Number.isInteger(numPlayers) && numPlayers >= 2 && numPlayers <= 5)) {
      return `Number of players, ${numPlayers}, must be an integer between 2 to 5.`;
    }
    return;
  },

  turn: {
    onBegin: ({ G }) => {
      Est.replenishSupply(G);
      Object.assign(G, newTurnG);
    },
    order: TurnOrder.CUSTOM_FROM('_turnOrder'),
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
    doOfficeGive: doOfficeGive,
    doOfficeTake: doOfficeTake,
    endTurn: endTurn,
  },

  plugins: [Log.LogxPlugin],

  playerView: PlayerView.STRIP_SECRETS!,
};
