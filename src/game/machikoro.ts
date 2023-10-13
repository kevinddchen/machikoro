//
// Implementation of Machikoro board game.
//

import { Ctx, Game, Move } from 'boardgame.io';
import { INVALID_MOVE, PlayerView, TurnOrder } from 'boardgame.io/core';
import { FnContext } from 'boardgame.io/dist/types/src/types';

import { assertNonNull, assertUnreachable } from 'common/typescript';

import * as Est from './establishments';
import * as Land from './landmarks';
import * as Log from './log';
import { EstColor, EstType, Establishment } from './establishments';
import { Expansion, MachikoroG, SetupData, SupplyVariant, TurnState, Version } from './types';
import { Landmark } from './landmarks';
import { validateSetupData } from './utils';

export const GAME_NAME = 'machikoro';

/**
 * Starting coins in Machi Koro 1.
 */
export const MK1_STARTING_COINS = 3;

/**
 * Starting coins in Machi Koro 2.
 */
export const MK2_STARTING_COINS = 5;

/**
 * Number of initial buy rounds in Machi Koro 2.
 */
export const MK2_INITIAL_BUY_ROUNDS = 3;

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
  const version = G.version;
  const player = parseInt(ctx.currentPlayer);
  // can roll 2 dice if you own Train Station (Machi Koro 1) or are playing Machi Koro 2
  const canRoll2 = Land.owns(G, player, Land.TrainStation) || version === Version.MK2;
  return (
    G.turnState === TurnState.Roll &&
    // can always roll 1 die
    (n === 1 || (n === 2 && canRoll2)) &&
    // can reroll if you own Radio Tower (Machi Koro 1)
    (G.numRolls === 0 || (G.numRolls === 1 && Land.owns(G, player, Land.RadioTower)))
  );
};

/**
 * @param G
 * @returns True if the current player has rolled the dice and can proceed
 * to evaluate its outcome.
 */
export const canCommitRoll = (G: MachikoroG): boolean => {
  return (
    G.turnState === TurnState.Roll &&
    // need to have rolled the dice
    G.numRolls > 0
  );
};

/**
 * @param G
 * @param ctx
 * @returns True if the current player can activate Harbor.
 */
export const canAddTwo = (G: MachikoroG, ctx: Ctx): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    canCommitRoll(G) &&
    // need to own harbor
    Land.owns(G, player, Land.Harbor) &&
    // need to roll a 10 or higher
    G.roll >= 10
  );
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
  const version = G.version;
  return (
    G.turnState === TurnState.Buy &&
    // establishment is available for purchase
    Est.countAvailable(G, est) > 0 &&
    // player has enough coins
    getCoins(G, player) >= est.cost &&
    // if playing Machi Koro 1 and establishment is major (purple), player does not already own it
    !(version === Version.MK1 && Est.isMajor(est) && Est.countOwned(G, player, est) > 0)
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

  const canBuyLoanOffice = (): boolean =>
    Land.countBuilt(G, player) === 0 && getPreviousPlayers(ctx).every((opponent) => Land.countBuilt(G, opponent) > 0);

  return (
    G.turnState === TurnState.Buy &&
    // landmark is available for purchase
    Land.isAvailable(G, land) &&
    // player does not currently own the landmark
    !Land.owns(G, player, land) &&
    // player has enough coins
    getCoins(G, player) >= Land.cost(G, land, player) &&
    // Loan Office has an extra restriction: must be only player without built landmarks
    (!Land.isEqual(land, Land.LoanOffice2) || canBuyLoanOffice())
  );
};

/**
 * @param G
 * @param ctx
 * @param opponent
 * @returns True if the current player can take coins from the opponent as a
 * part of the TV Station (Machi Koro 1) action.
 */
export const canDoTV = (G: MachikoroG, ctx: Ctx, opponent: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.turnState === TurnState.TV &&
    // cannot take from self
    opponent !== player
  );
};

/**
 * @param G
 * @param ctx
 * @param est
 * @returns True if the current player can pick the establishment to give up,
 * as part of the Office or Moving Company actions.
 */
export const canDoOfficeGive = (G: MachikoroG, ctx: Ctx, est: Establishment): boolean => {
  const player = parseInt(ctx.currentPlayer);
  const version = G.version;
  const possibleTurnStates: TurnState[] = [TurnState.OfficeGive, TurnState.MovingCompanyGive, TurnState.MovingCompany2];
  return (
    possibleTurnStates.includes(G.turnState) &&
    // must own the establishment
    Est.countOwned(G, player, est) > 0 &&
    // if playing Machi Koro 1, cannot give major (purple)
    (version !== Version.MK1 || !Est.isMajor(est))
  );
};

/**
 * @param G
 * @param ctx
 * @param opponent
 * @param est
 * @returns True if the current player can take the opponent's establishment,
 * as a part of the Office action.
 */
export const canDoOfficeTake = (G: MachikoroG, ctx: Ctx, opponent: number, est: Establishment): boolean => {
  const player = parseInt(ctx.currentPlayer);
  const version = G.version;
  return (
    G.turnState === TurnState.OfficeTake &&
    // cannot take from self
    opponent !== player &&
    // opponent must own the establishment
    Est.countOwned(G, opponent, est) > 0 &&
    // if playing Machi Koro 1, cannot take major (purple)
    (version !== Version.MK1 || !Est.isMajor(est))
  );
};

/**
 * @param G
 * @returns True if the current player can skip the Office action. Can only be
 * done in Machi Koro 2.
 */
export const canSkipOffice = (G: MachikoroG): boolean => {
  const version = G.version;
  return (
    (G.turnState === TurnState.OfficeGive || G.turnState === TurnState.OfficeTake) &&
    // only in Machi Koro 2
    version === Version.MK2
  );
};

/**
 * @param G
 * @param ctx
 * @param opponent
 * @returns True if the current player can demolish the landmark as a part of
 * the Demolition Company action.
 */
export const canDoDemolitionCompany = (G: MachikoroG, ctx: Ctx, land: Landmark): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.turnState === TurnState.DemolitionCompany &&
    // player must own the landmark
    Land.owns(G, player, land) &&
    // cannot demolish City Hall
    !(Land.isEqual(land, Land.CityHall) || Land.isEqual(land, Land.CityHall2))
  );
};

/**
 * @param G
 * @param ctx
 * @param opponent
 * @returns True if the current player can give an establishment to the
 * opponent as part of the Moving Company (Machi Koro 1) action.
 */
export const canDoMovingCompanyOpp = (G: MachikoroG, ctx: Ctx, opponent: number): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    G.turnState === TurnState.MovingCompanyOpp &&
    // cannot give to self
    opponent !== player
  );
};

/**
 * @param G
 * @param est
 * @returns True if the current player can pick the establishment for the
 * Renovation Company action.
 */
export const canDoRenovationCompany = (G: MachikoroG, est: Establishment): boolean => {
  return (
    G.turnState === TurnState.RenovationCompany &&
    // cannot pick major (purple)
    !Est.isMajor(est)
  );
};

/**
 * @param G
 * @returns An establishment that the current player can activate with the
 * Renovation Company action to effectively "skip" it, of null if such an
 * establishment does not exist.
 */
export const canSkipRenovationCompany = (G: MachikoroG): Establishment | null => {
  if (G.turnState !== TurnState.RenovationCompany) {
    return null;
  }
  return Est.unownedRedBlueGreenEst(G);
};

/**
 * @param G
 * @returns True if the current player can invest in the Tech Startup
 * establishment (Machi Koro 1).
 */
export const canInvestTechStartup = (G: MachikoroG, ctx: Ctx): boolean => {
  const player = parseInt(ctx.currentPlayer);
  return (
    (G.turnState === TurnState.Buy || G.turnState === TurnState.End) &&
    // player must own the establishment
    Est.countOwned(G, player, Est.TechStartup) > 0 &&
    // player has enough coins
    getCoins(G, player) >= 1 &&
    // player must not have invested this turn
    !G.didTechStartup
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
  const { version, expansions } = G;
  if (version === Version.MK1) {
    // a player has won if they own all landmarks in use
    return Land.getAllInUse(version, expansions).every((land) => Land.owns(G, player, land));
  } else if (version === Version.MK2) {
    // a player has won if they have built Launch Pad or 3 landmarks (excluding City Hall)
    return Land.owns(G, player, Land.LaunchPad2) || Land.countBuilt(G, player) >= Land.MK2_LANDMARKS_TO_WIN;
  } else {
    return assertUnreachable(version);
  }
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
  G.rollDoubles = false;
  G.numDice = 1;
  G.numRolls += 1;
  Log.logRollOne(G, G.roll);

  if (noFurtherRollActions(G, ctx)) {
    switchState(context);
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
  G.roll = dice[0] + dice[1];
  G.rollDoubles = dice[0] === dice[1];
  G.numDice = 2;
  G.numRolls += 1;
  Log.logRollTwo(G, [dice[0], dice[1]]);

  if (noFurtherRollActions(G, ctx)) {
    switchState(context);
  }

  return;
};

/**
 * Force the outcome of the dice roll. This move is removed in production.
 * @param context
 * @param die1 - Desired first die value.
 * @param die2 - Desired second die value. If not provided, defaults to 0.
 */
const debugRoll: Move<MachikoroG> = (
  context,
  die1: number,
  die2: number = 0, // eslint-disable-line @typescript-eslint/no-inferrable-types
) => {
  const { G, ctx } = context;
  if (!canRoll(G, ctx, 1)) {
    return INVALID_MOVE;
  }

  G.roll = die1 + die2;
  G.rollDoubles = die1 == die2;
  G.numRolls += 1;
  if (die2 === 0) {
    G.numDice = 1;
    Log.logRollOne(G, die1);
  } else {
    G.numDice = 2;
    Log.logRollTwo(G, [die1, die2]);
  }

  if (noFurtherRollActions(G, ctx)) {
    switchState(context);
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

  switchState(context);

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

  G.roll += 2;
  Log.logAddTwo(G, G.roll);

  switchState(context);

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
  addCoins(G, player, -est.cost);
  Est.buy(G, player, est);
  G.justBoughtEst = est;
  Log.logBuy(G, est.name);

  switchState(context);

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
  addCoins(G, player, -Land.cost(G, land, player)); // must be before `Land.buy` since price depends on owned landmarks
  Land.buy(G, player, land);
  G.justBoughtLand = land;
  Log.logBuy(G, land.name);

  switchState(context);

  return;
};

/**
 * Perform the TV Station (Machi Koro 1) action by picking an opponent to take
 * 5 coins from.
 * @param context
 * @param opponent
 */
const doTV: Move<MachikoroG> = (context, opponent: number) => {
  const { G, ctx } = context;
  if (!canDoTV(G, ctx, opponent)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  take(G, ctx, { from: opponent, to: player }, Est.TVStation.earn, Est.TVStation.name);

  switchState(context);

  return;
};

/**
 * Perform the Office or Moving Company action by picking an establishment you
 * own to give up.
 * @param context
 * @param est
 * @param renovation - True if the establishment is closed for renovations.
 */
const doOfficeGive: Move<MachikoroG> = (context, est: Establishment, renovation: boolean) => {
  const { G, ctx } = context;
  if (!canDoOfficeGive(G, ctx, est)) {
    return INVALID_MOVE;
  }

  if (G.turnState === TurnState.OfficeGive) {
    G.officeGiveEst = est;
    G.officeGiveRenovation = renovation;
    // change game state directly instead of calling `switchState`
    G.turnState = TurnState.OfficeTake;
  } else if (G.turnState === TurnState.MovingCompanyGive) {
    G.officeGiveEst = est;
    G.officeGiveRenovation = renovation;
    // change game state directly instead of calling `switchState`
    G.turnState = TurnState.MovingCompanyOpp;
  } else if (G.turnState === TurnState.MovingCompany2) {
    const player = parseInt(ctx.currentPlayer);
    const prevPlayer = getPreviousPlayers(ctx)[0];
    Est.transfer(G, { from: player, to: prevPlayer }, est, renovation);
    Log.logMovingCompany(G, est.name, prevPlayer);
    switchState(context);
  } else {
    throw new Error(`Unexpected error: 'doOfficeGive' called in an unexpected state ${G.turnState}.`);
  }

  return;
};

/**
 * Perform the Office action by picking an establishment an opponent owns to
 * take.
 * @param context
 * @param opponent
 * @param est
 * @param renovation - True if the establishment is closed for renovations.
 */
const doOfficeTake: Move<MachikoroG> = (context, opponent: number, est: Establishment, renovation: boolean) => {
  const { G, ctx } = context;
  if (!canDoOfficeTake(G, ctx, opponent, est)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  if (G.officeGiveEst === null || G.officeGiveRenovation === null) {
    throw new Error(
      'Unexpected error: `G.officeGiveEst` and `G.officeGiveRenovation` should be set before `doOfficeTake`.',
    );
  }
  Est.transfer(G, { from: player, to: opponent }, G.officeGiveEst, G.officeGiveRenovation);
  Est.transfer(G, { from: opponent, to: player }, est, renovation);
  Log.logOffice(G, { player_est_name: G.officeGiveEst.name, opponent_est_name: est.name }, opponent);

  // cleanup
  G.officeGiveEst = null;
  G.officeGiveRenovation = null;

  switchState(context);

  return;
};

/**
 * Skip the Office action. Can only be done in Machi Koro 2.
 * @param context
 * @returns
 */
const skipOffice: Move<MachikoroG> = (context) => {
  const { G } = context;
  if (!canSkipOffice(G)) {
    return INVALID_MOVE;
  }

  // cleanup
  G.officeGiveEst = null;
  G.officeGiveRenovation = null;
  G.doOffice = 0;

  switchState(context);

  return;
};

/**
 * Perform the Demolition Company action by picking a landmark to demolish.
 * @param context
 * @param land
 */
const doDemolitionCompany: Move<MachikoroG> = (context, land: Landmark) => {
  const { G, ctx } = context;
  if (!canDoDemolitionCompany(G, ctx, land)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  Land.demolish(G, player, land);
  Log.logDemolitionCompany(G, land.name);

  switchState(context);

  return;
};

/**
 * Perform the Moving Company (Machi Koro 1) action by picking an opponent to
 * give an establishment to.
 * @param context
 * @param opponent
 */
const doMovingCompanyOpp: Move<MachikoroG> = (context, opponent: number) => {
  const { G, ctx } = context;
  if (!canDoMovingCompanyOpp(G, ctx, opponent)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  if (G.officeGiveEst === null || G.officeGiveRenovation === null) {
    throw new Error(
      'Unexpected error: `G.officeGiveEst` and `G.officeGiveRenovation` should be set before `doMovingCompanyOpp`.',
    );
  }
  Est.transfer(G, { from: player, to: opponent }, G.officeGiveEst, G.officeGiveRenovation);
  Log.logMovingCompany(G, G.officeGiveEst.name, opponent);

  // cleanup
  G.officeGiveEst = null;
  G.officeGiveRenovation = null;

  switchState(context);

  return;
};

/**
 * Perform the Renovation Company action by closing all establishments of the
 * given type.
 * @param context
 * @param est
 * @returns
 */
const doRenovationCompany: Move<MachikoroG> = (context, est: Establishment) => {
  const { G, ctx } = context;
  if (!canDoRenovationCompany(G, est)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);

  // close own establishments
  const playerCount = Est.countOwned(G, player, est);
  Est.setRenovationCount(G, player, est, playerCount);

  // get coins from opponents and close their establishments
  for (const opponent of getPreviousPlayers(ctx)) {
    const count = Est.countOwned(G, opponent, est);
    const countRenovation = Est.countRenovation(G, opponent, est);
    if (count > countRenovation) {
      const amount = (count - countRenovation) * Est.RenovationCompany.earn;
      take(G, ctx, { from: opponent, to: player }, amount, Est.RenovationCompany.name);
    }
    Est.setRenovationCount(G, opponent, est, count);
  }

  switchState(context);

  return;
};

/**
 * Invest in the Tech Startup establishment (Machi Koro 1).
 * @param context
 * @returns
 */
const investTechStartup: Move<MachikoroG> = (context) => {
  const { G, ctx } = context;
  if (!canInvestTechStartup(G, ctx)) {
    return INVALID_MOVE;
  }

  const player = parseInt(ctx.currentPlayer);
  addCoins(G, player, -1);
  Est.incrementInvestment(G, player);
  G.didTechStartup = true;
  Log.logInvestTechStartup(G, Est.getInvestment(G, player));

  // change game state directly instead of calling `switchState`
  G.turnState = TurnState.End;

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

  const { initialBuyRounds } = G;
  const { phase, turn, numPlayers } = ctx;
  const player = parseInt(ctx.currentPlayer);

  // a player earns coins via the airport if they did not buy anything
  if (G.turnState === TurnState.Buy) {
    for (const airport of [Land.Airport, Land.Airport2]) {
      if (Land.owns(G, player, airport)) {
        assertNonNull(airport.coins);
        earn(G, ctx, player, airport.coins, airport.name);
      }
    }
  }

  // end initial buying phase after `initialBuyRounds` rounds
  if (phase === 'initialBuyPhase' && turn === initialBuyRounds * numPlayers) {
    Log.logOtherEvent(G, '(End of initial build phase)');
    events.endPhase();
  }

  // check second turn
  if (G.secondTurn) {
    events.endTurn({ next: player.toString() });
  } else {
    events.endTurn();
  }

  // no `switchState` because turn has ended.
  return;
};

//
// === Move Helpers ===
//
// These functions are used by Moves, and may modify `G`.
//

/**
 * Modify a player's coins by the given amount. No check is made as to whether
 * the player's coins will go negative.
 * @param G
 * @param player
 * @param amount - Number of coins to give to the player. Can be negative.
 */
const addCoins = (G: MachikoroG, player: number, amount: number): void => {
  G._coins[player] += amount;
};

/**
 * This function controls the flow of the turn's state. This should be called
 * at the end of all Moves.
 * @param context
 */
const switchState = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const player = parseInt(ctx.currentPlayer);

  if (G.turnState < TurnState.ActivateRedEsts) {
    activateRedEsts(context);
  }
  if (G.turnState < TurnState.DemolitionCompany) {
    // first get coins
    activateDemolitionCompany(context);
    G.turnState = TurnState.DemolitionCompany;
  }
  if (G.turnState === TurnState.DemolitionCompany) {
    // can do multiple times
    if (G.doDemolitionCompany > 0) {
      G.doDemolitionCompany -= 1;
      return; // await player action
    }
  }
  if (G.turnState < TurnState.ActivateBlueGreenEsts) {
    activateBlueGreenEsts(context);
  }
  if (G.turnState <= TurnState.MovingCompanyOpp) {
    // can do multiple times
    if (G.doMovingCompany > 0) {
      G.doMovingCompany -= 1;
      G.turnState = TurnState.MovingCompanyGive;
      return; // await player action
    }
  }
  if (G.turnState < TurnState.ActivatePurpleEsts) {
    activatePurpleEsts(context);
  }
  if (G.turnState < TurnState.TV) {
    if (G.doTV) {
      G.doTV = false;
      G.turnState = TurnState.TV;
      return; // await player action
    }
  }
  if (G.turnState <= TurnState.OfficeTake) {
    // can do multiple times
    if (G.doOffice > 0) {
      G.doOffice -= 1;
      G.turnState = TurnState.OfficeGive;
      return; // await player action
    }
  }
  if (G.turnState < TurnState.RenovationCompany) {
    if (G.doRenovationCompany) {
      G.doRenovationCompany = false;
      G.turnState = TurnState.RenovationCompany;
      return; // await player action
    }
  }
  if (G.turnState < TurnState.ActivateLands) {
    activateLands(context);
  }
  if (G.turnState < TurnState.MovingCompany2) {
    if (G.doMovingCompany2) {
      G.doMovingCompany2 = false;
      G.turnState = TurnState.MovingCompany2;
      return; // await player action
    }
  }
  if (G.turnState < TurnState.Buy) {
    // activate city hall before buying
    if (getCoins(G, player) === 0) {
      for (const cityHall of [Land.CityHall, Land.CityHall2]) {
        if (Land.owns(G, player, cityHall)) {
          assertNonNull(cityHall.coins);
          addCoins(G, player, cityHall.coins);
          Log.logEarn(G, player, cityHall.coins, cityHall.name);
        }
      }
    }

    G.turnState = TurnState.Buy;
    return; // await player action
  }
  if (G.turnState < TurnState.ActivateBoughtLand) {
    // first, check if game is over
    if (canEndGame(G, ctx)) {
      endGame(context, player);
      return;
    }

    activateBoughtLand(context);
  }
  if (G.turnState <= TurnState.End) {
    G.turnState = TurnState.End;
    return; // await player action
  }
};

/**
 * Activate red establishments.
 * @param context
 */
const activateRedEsts = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const currentPlayer = parseInt(ctx.currentPlayer);
  const roll = G.roll;
  const allEsts = Est.getAllInUse(G.version, G.expansions);

  const redEsts = allEsts.filter((est) => est.color === EstColor.Red && est.rolls.includes(roll));
  for (const opponent of getPreviousPlayers(ctx)) {
    for (const est of redEsts) {
      // get number owned, subtract number closed for renovations
      const count = Est.countOwned(G, opponent, est) - Est.countRenovation(G, opponent, est);

      if (count > 0) {
        // Member's Only Club earnings are all coins from the opponent
        // all other red establishments get `est.earn` coins from the bank
        let earnings: number;
        if (Est.isEqual(est, Est.MembersOnlyClub)) {
          earnings = getCoins(G, currentPlayer);
        } else {
          earnings = est.earn;
        }

        // +1 coin to Cup type if opponent owns Shopping Mall
        if (est.type === EstType.Cup && Land.owns(G, opponent, Land.ShoppingMall)) {
          assertNonNull(Land.ShoppingMall.coins);
          earnings += Land.ShoppingMall.coins;
        }
        // +1 coin to Cup type if any player owns Soda Bottling Plant (Machi Koro 2)
        if (est.type === EstType.Cup && Land.isOwned(G, Land.SodaBottlingPlant2)) {
          assertNonNull(Land.SodaBottlingPlant2.coins);
          earnings += Land.SodaBottlingPlant2.coins;
        }

        // by default a red establishment takes `multiplier * earnings = 1 * earnings`
        // but there are special cases where `multiplier` is not 1.
        let multiplier: number;
        if (Est.isEqual(est, Est.SushiBar)) {
          multiplier = Land.owns(G, opponent, Land.Harbor) ? 1 : 0;
        } else if (Est.isEqual(est, Est.FrenchRestaurant)) {
          multiplier = Land.countBuilt(G, currentPlayer) >= 2 ? 1 : 0;
        } else if (Est.isEqual(est, Est.MembersOnlyClub)) {
          multiplier = Land.countBuilt(G, currentPlayer) >= 3 ? 1 : 0;
        } else {
          multiplier = 1;
        }

        const amount = earnings * multiplier * count;
        take(G, ctx, { from: currentPlayer, to: opponent }, amount, est.name);
      }

      // if there are establishments closed for renovations, open them
      Est.setRenovationCount(G, opponent, est, 0);
    }
  }
};

/**
 * Activate the Demolition Company establishment.
 * @param context
 */
const activateDemolitionCompany = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const currentPlayer = parseInt(ctx.currentPlayer);
  const roll = G.roll;

  if (Est.isInUse(Est.DemolitionCompany, G.version, G.expansions) && Est.DemolitionCompany.rolls.includes(roll)) {
    // get number owned, subtract number closed for renovations
    let count =
      Est.countOwned(G, currentPlayer, Est.DemolitionCompany) -
      Est.countRenovation(G, currentPlayer, Est.DemolitionCompany);

    // cannot be more than number of built landmarks
    count = Math.min(count, Land.countBuilt(G, currentPlayer));

    if (count > 0) {
      G.doDemolitionCompany = count;
      const earnings = Est.DemolitionCompany.earn;
      const amount = earnings * count;
      earn(G, ctx, currentPlayer, amount, Est.DemolitionCompany.name);
    }

    // if there are establishments closed for renovations, open them
    Est.setRenovationCount(G, currentPlayer, Est.DemolitionCompany, 0);
  }
};

/**
 * Activate blue and green establishments.
 * @param context
 */
const activateBlueGreenEsts = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const currentPlayer = parseInt(ctx.currentPlayer);
  const roll = G.roll;
  const allEsts = Est.getAllInUse(G.version, G.expansions);

  // Do `LoanOffice` first.
  if (Est.isInUse(Est.LoanOffice, G.version, G.expansions) && Est.LoanOffice.rolls.includes(roll)) {
    // get number owned, subtract number closed for renovations
    const count =
      Est.countOwned(G, currentPlayer, Est.LoanOffice) - Est.countRenovation(G, currentPlayer, Est.LoanOffice);

    if (count > 0) {
      const earnings = Est.LoanOffice.earn;
      const amount = earnings * count;
      earn(G, ctx, currentPlayer, amount, Est.LoanOffice.name);
    }

    // if there are establishments closed for renovations, open them
    Est.setRenovationCount(G, currentPlayer, Est.LoanOffice, 0);
  }

  // Do Blue establishments.
  const blueEsts = allEsts.filter((est) => est.color === EstColor.Blue && est.rolls.includes(roll));
  for (const player of getNextPlayers(ctx)) {
    for (const est of blueEsts) {
      // get number owned, subtract number closed for renovations
      const count = Est.countOwned(G, player, est) - Est.countRenovation(G, player, est);

      // the `if` below avoids logging Tuna Boat roll when player has no tuna boats
      if (count > 0) {
        // by default a blue establishment earns `multiplier * earnings = 1 * earnings`
        // but there are special cases where `multiplier` is not 1.
        let multiplier: number;
        if (Est.isEqual(est, Est.MackerelBoat) || Est.isEqual(est, Est.TunaBoat)) {
          multiplier = Land.owns(G, player, Land.Harbor) ? 1 : 0;
        } else if (Est.isEqual(est, Est.CornField)) {
          multiplier = Land.countBuilt(G, player) < 2 ? 1 : 0;
        } else {
          multiplier = 1;
        }

        if (multiplier === 0) {
          continue; // avoids logging Tuna Boat roll when player has no Harbor
        }

        // Tuna Boat earnings are based off the tuna roll
        // all other blue establishments get `est.earn` coins from the bank
        let earnings: number;
        if (Est.isEqual(est, Est.TunaBoat)) {
          earnings = getTunaRoll(context);
        } else {
          earnings = est.earn;
        }

        // +1 coin to Wheat type if any player owns Farmers Market (Machi Koro 2)
        if (est.type === EstType.Wheat && Land.isOwned(G, Land.FarmersMarket2)) {
          assertNonNull(Land.FarmersMarket2.coins);
          earnings += Land.FarmersMarket2.coins;
        }
        // +1 coin to Gear type if any player owns Forge (Machi Koro 2)
        if (est.type === EstType.Gear && Land.isOwned(G, Land.Forge2)) {
          assertNonNull(Land.Forge2.coins);
          earnings += Land.Forge2.coins;
        }

        const amount = earnings * multiplier * count;
        earn(G, ctx, player, amount, est.name);
      }

      // if there are establishments closed for renovations, open them
      Est.setRenovationCount(G, player, est, 0);
    }
  }

  // Do Green establishments.
  const greenEsts = allEsts.filter((est) => est.color === EstColor.Green && est.rolls.includes(roll));
  for (const est of greenEsts) {
    if (Est.isEqual(est, Est.DemolitionCompany) || Est.isEqual(est, Est.LoanOffice)) {
      continue; // handled above
    }

    // get number owned, subtract number closed for renovations
    const count = Est.countOwned(G, currentPlayer, est) - Est.countRenovation(G, currentPlayer, est);

    if (count > 0) {
      if (Est.isEqual(est, Est.MovingCompany)) {
        G.doMovingCompany = count;
        // do not continue; player gets coins below
      }

      let earnings = est.earn;
      // +1 coin to Shop type if player owns Shopping Mall
      if (est.type === EstType.Shop && Land.owns(G, currentPlayer, Land.ShoppingMall)) {
        assertNonNull(Land.ShoppingMall.coins);
        earnings += Land.ShoppingMall.coins;
      }
      // +1 coin to Shop type if any player owns Shopping Mall (Machi Koro 2)
      if (est.type === EstType.Shop && Land.isOwned(G, Land.ShoppingMall2)) {
        assertNonNull(Land.ShoppingMall2.coins);
        earnings += Land.ShoppingMall2.coins;
      }

      // by default a green establishment earns `multiplier * earnings = 1 * earnings`
      // but there are special cases where `multiplier` is not 1.
      let multiplier: number;
      if (Est.isEqual(est, Est.CheeseFactory)) {
        multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Animal);
      } else if (Est.isEqual(est, Est.FurnitureFactory) || Est.isEqual(est, Est.FurnitureFactory2)) {
        multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Gear);
      } else if (Est.isEqual(est, Est.FarmersMarket)) {
        multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Wheat);
      } else if (Est.isEqual(est, Est.FlowerShop)) {
        multiplier = Est.countOwned(G, currentPlayer, Est.FlowerGarden);
      } else if (Est.isEqual(est, Est.FlowerShop2)) {
        multiplier = Est.countOwned(G, currentPlayer, Est.FlowerGarden2);
      } else if (Est.isEqual(est, Est.FoodWarehouse) || Est.isEqual(est, Est.FoodWarehouse2)) {
        multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Cup);
      } else if (Est.isEqual(est, Est.Winery)) {
        multiplier = Est.countOwned(G, currentPlayer, Est.Vineyard);
      } else if (Est.isEqual(est, Est.Winery2)) {
        multiplier = Est.countTypeOwned(G, currentPlayer, EstType.Fruit);
      } else if (Est.isEqual(est, Est.GeneralStore)) {
        multiplier = Land.countBuilt(G, currentPlayer) < 2 ? 1 : 0;
      } else if (Est.isEqual(est, Est.SodaBottlingPlant)) {
        multiplier = 0;
        for (const player of getNextPlayers(ctx)) {
          multiplier += Est.countTypeOwned(G, player, EstType.Cup);
        }
      } else {
        multiplier = 1;
      }

      const amount = earnings * multiplier * count;
      earn(G, ctx, currentPlayer, amount, est.name);
    }

    // if there are establishments closed for renovations, open them
    if (Est.isEqual(est, Est.Winery)) {
      // NOTE: it is slightly strange, but `Winery` will close for renovations even if there is no `Vineyard`
      Est.setRenovationCount(G, currentPlayer, Est.Winery, count);
    } else {
      Est.setRenovationCount(G, currentPlayer, est, 0);
    }
  }
};

/**
 * Activate purple establishments.
 * @param context
 */
const activatePurpleEsts = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const currentPlayer = parseInt(ctx.currentPlayer);
  const roll = G.roll;
  const allEsts = Est.getAllInUse(G.version, G.expansions);

  const purpleEsts = allEsts.filter((est) => est.color === EstColor.Purple && est.rolls.includes(roll));
  for (const est of purpleEsts) {
    const count = Est.countOwned(G, currentPlayer, est);
    if (count === 0) {
      continue; // skips activating unowned purple establishments below
    }

    // each purple establishment has its own effect
    // for Machi Koro 1, `count` should always be 1 here
    if (Est.isEqual(est, Est.Stadium) || Est.isEqual(est, Est.Stadium2)) {
      // take 2 coins from each opponent
      for (const opponent of getPreviousPlayers(ctx)) {
        const amount = est.earn * count;
        take(G, ctx, { from: opponent, to: currentPlayer }, amount, est.name);
      }
    } else if (Est.isEqual(est, Est.TVStation)) {
      G.doTV = true;
    } else if (Est.isEqual(est, Est.Office) || Est.isEqual(est, Est.Office2)) {
      if (officeTradeExists(context)) {
        G.doOffice = count;
      }
    } else if (Est.isEqual(est, Est.Publisher)) {
      // take 1 coin for each Cup and Shop type establishment
      for (const opponent of getPreviousPlayers(ctx)) {
        const n_cups = Est.countTypeOwned(G, opponent, EstType.Cup);
        const n_shops = Est.countTypeOwned(G, opponent, EstType.Shop);
        const amount = est.earn * (n_cups + n_shops) * count;
        take(G, ctx, { from: opponent, to: currentPlayer }, amount, est.name);
      }
    } else if (Est.isEqual(est, Est.TaxOffice) || Est.isEqual(est, Est.TaxOffice2)) {
      activateTaxOffice(G, ctx, count, est.name);
    } else if (Est.isEqual(est, Est.Park)) {
      activatePark(G, ctx);
    } else if (Est.isEqual(est, Est.RenovationCompany)) {
      G.doRenovationCompany = true;
    } else if (Est.isEqual(est, Est.TechStartup)) {
      for (const opponent of getPreviousPlayers(ctx)) {
        const amount = Est.getInvestment(G, currentPlayer) * count;
        take(G, ctx, { from: opponent, to: currentPlayer }, amount, est.name);
      }
    }
  }
};

/**
 * Activate continuous effect landmarks.
 * @param context
 */
const activateLands = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const player = parseInt(ctx.currentPlayer);

  if ((Land.owns(G, player, Land.AmusementPark) || Land.isOwned(G, Land.AmusementPark2)) && G.rollDoubles) {
    // if roll doubles, get second turn
    G.secondTurn = true;
  }
  if (Land.isOwned(G, Land.TechStartup2) && G.roll === 12) {
    // if roll 12, get 8 coins
    assertNonNull(Land.TechStartup2.coins);
    earn(G, ctx, player, Land.TechStartup2.coins, Land.TechStartup2.name);
  }
  if (Land.isOwned(G, Land.Temple2) && G.rollDoubles) {
    // take 2 coins from each opponent
    for (const opponent of getPreviousPlayers(ctx)) {
      assertNonNull(Land.Temple2.coins);
      take(G, ctx, { from: opponent, to: player }, Land.Temple2.coins, Land.Temple2.name);
    }
  }
  if (Land.isOwned(G, Land.MovingCompany2) && G.rollDoubles && Est.getAllOwned(G, player).length > 0) {
    // give 1 establishment to previous player
    G.doMovingCompany2 = true;
  }
  if (Land.isOwned(G, Land.Charterhouse2) && G.numDice === 2 && !G.receivedCoins) {
    // NOTE: this must activate after all money-earning landmarks!
    // get 3 coins from the bank
    assertNonNull(Land.Charterhouse2.coins);
    earn(G, ctx, player, Land.Charterhouse2.coins, Land.Charterhouse2.name);
  }
};

/**
 * Activate landmark that was just bought, if it has an immediate effect.
 * @param context
 */
const activateBoughtLand = (context: FnContext<MachikoroG>): void => {
  const { G, ctx } = context;
  const land = G.justBoughtLand;
  const player = parseInt(ctx.currentPlayer);

  if (land === null) {
    return; // no land was just bought
  }

  // Launch Pad is not activated here, but is checked as a win condition in `canEndGame`
  if (Land.isEqual(land, Land.RadioTower2)) {
    // get second turn
    G.secondTurn = true;
  } else if (Land.isEqual(land, Land.FrenchRestaurant2)) {
    // take 2 coins from each opponent
    for (const opponent of getPreviousPlayers(ctx)) {
      assertNonNull(land.coins);
      const amount = land.coins;
      take(G, ctx, { from: opponent, to: player }, amount, land.name);
    }
  } else if (Land.isEqual(land, Land.Publisher2)) {
    // take 1 coin for each Shop type establishment
    for (const opponent of getPreviousPlayers(ctx)) {
      assertNonNull(land.coins);
      const amount = land.coins * Est.countTypeOwned(G, opponent, EstType.Shop);
      take(G, ctx, { from: opponent, to: player }, amount, land.name);
    }
  } else if (Land.isEqual(land, Land.ExhibitHall2)) {
    // do tax office on each opponent
    activateTaxOffice(G, ctx, 1, land.name);
  } else if (Land.isEqual(land, Land.Museum2)) {
    // take 3 coins for each landmark, except City Hall
    for (const opponent of getPreviousPlayers(ctx)) {
      assertNonNull(land.coins);
      const amount = land.coins * Land.countBuilt(G, opponent);
      take(G, ctx, { from: opponent, to: player }, amount, land.name);
    }
  } else if (Land.isEqual(land, Land.TVStation2)) {
    // take 1 coin for each Cup type establishment
    for (const opponent of getPreviousPlayers(ctx)) {
      assertNonNull(land.coins);
      const amount = land.coins * Est.countTypeOwned(G, opponent, EstType.Cup);
      take(G, ctx, { from: opponent, to: player }, amount, land.name);
    }
  } else if (Land.isEqual(land, Land.Park2)) {
    activatePark(G, ctx);
  }
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
 * @param ctx
 * @param player
 * @param amount - Number of coins. If zero, no log is created.
 * @param name - Name of establishment or landmark activated.
 */
const earn = (G: MachikoroG, ctx: Ctx, player: number, amount: number, name: string): void => {
  const currentPlayer = parseInt(ctx.currentPlayer);
  const actual_amount = Math.max(amount, -getCoins(G, player)); // handle when amount < 0
  addCoins(G, player, actual_amount);
  if (actual_amount !== 0) {
    if (currentPlayer === player && actual_amount > 0) {
      G.receivedCoins = true;
    }
    Log.logEarn(G, player, actual_amount, name);
  }
};

/**
 * Player takes coins from another player, and the event is logged.
 * @param G
 * @param ctx
 * @param args.from - Coins are taken from this player
 * @param args.to - Coins are given to this player
 * @param amount - Number of coins. If zero, no log is created. Actual money
 * taken will never exceed the amount `args.from` has.
 * @param name - Name of establishment or landmark activated.
 */
const take = (G: MachikoroG, ctx: Ctx, args: { from: number; to: number }, amount: number, name: string): void => {
  const currentPlayer = parseInt(ctx.currentPlayer);
  const { from, to } = args;
  const actual_amount = Math.min(amount, getCoins(G, from));
  addCoins(G, from, -actual_amount);
  addCoins(G, to, actual_amount);
  if (actual_amount > 0) {
    if (currentPlayer === to) {
      G.receivedCoins = true;
    }
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
 * End the game.
 * @param context
 * @param winner - ID of the winning player.
 */
const endGame = (context: FnContext<MachikoroG>, winner: number): void => {
  const { G, events } = context;
  Log.logEndGame(G, winner);
  events.endGame();
};

/**
 * Check if an Office trade exists.
 * @param context
 * @returns `true` if a valid trade exists, `false` otherwise.
 */
const officeTradeExists = (context: FnContext<MachikoroG>): boolean => {
  const { G, ctx } = context;
  const currentPlayer = parseInt(ctx.currentPlayer);
  let currentPlayerEsts = Est.getAllOwned(G, currentPlayer);
  if (G.version === Version.MK1) {
    // filter out major establishments
    currentPlayerEsts = currentPlayerEsts.filter((est) => est.color !== EstColor.Purple);
  }
  if (currentPlayerEsts.length === 0) {
    return false;
  }

  for (const opponent of getPreviousPlayers(ctx)) {
    let opponentEsts = Est.getAllOwned(G, opponent);
    if (G.version === Version.MK1) {
      // filter out major establishments
      opponentEsts = opponentEsts.filter((est) => est.color !== EstColor.Purple);
    }
    if (opponentEsts.length > 0) {
      return true;
    }
  }

  return false;
};

/**
 * Perform the Tax Office action - take half of an opponent's coins.
 * @param G
 * @param ctx
 * @param count - Number of times to activate the Tax Office.
 * @param name - Name of the establishment / landmark.
 */
const activateTaxOffice = (G: MachikoroG, ctx: Ctx, count: number, name: string): void => {
  const currentPlayer = parseInt(ctx.currentPlayer);
  // In Machi Koro 1, triggers on 10+ coins. In Machi Koro 2, triggers on 11+ coins.
  const trigger = G.version === Version.MK1 ? 10 : 11;
  for (const opponent of getPreviousPlayers(ctx)) {
    for (let i = 0; i < count; i++) {
      const opp_coins = getCoins(G, opponent);
      if (opp_coins < trigger) {
        break;
      }
      const amount = Math.floor(opp_coins / 2);
      take(G, ctx, { from: opponent, to: currentPlayer }, amount, name);
    }
  }
};

/**
 * Perform the Park action - redistribute everyone's coins evenly.
 * @param G
 * @param ctx
 */
const activatePark = (G: MachikoroG, ctx: Ctx): void => {
  const { numPlayers } = ctx;

  const players = [...Array(numPlayers).keys()];
  const playerCoins = players.map((player) => getCoins(G, player));
  const totalCoins = playerCoins.reduce((a, b) => a + b, 0);

  // each player should have this many coins
  const coinsPerPlayer = Math.ceil(totalCoins / numPlayers);

  for (const player of players) {
    addCoins(G, player, coinsPerPlayer - playerCoins[player]);
  }

  Log.logPark(G, coinsPerPlayer);
};

//
// === Game ===
//
// Declaring the game object.
//

/**
 * Set-up data for debug mode.
 */
const debugSetupData: SetupData = {
  version: Version.MK1,
  expansions: [Expansion.Base, Expansion.Harbor, Expansion.Million],
  // version: Version.MK2,
  // expansions: [Expansion.Base],
  supplyVariant: SupplyVariant.Total,
  startCoins: 99,
  initialBuyRounds: 0,
  randomizeTurnOrder: false,
};

/**
 * Properties of `G` to overwrite on a new turn.
 */
const newTurnG = {
  turnState: TurnState.Roll,
  roll: 0,
  rollDoubles: false,
  numDice: 0,
  numRolls: 0,
  secondTurn: false,
  doTV: false,
  doOffice: 0,
  doDemolitionCompany: 0,
  doMovingCompany: 0,
  doMovingCompany2: false,
  doRenovationCompany: false,
  didTechStartup: false,
  officeGiveEst: null,
  officeGiveRenovation: null,
  justBoughtEst: null,
  justBoughtLand: null,
  receivedCoins: false,
  tunaRoll: null,
};

export const Machikoro: Game<MachikoroG, Record<string, unknown>, SetupData> = {
  name: GAME_NAME,

  setup: ({ ctx, random }, setupData) => {
    if (!setupData) {
      setupData = debugSetupData;
    }
    const { version, expansions, supplyVariant, startCoins, initialBuyRounds, randomizeTurnOrder } = setupData;
    const { numPlayers } = ctx;

    // initialize coins
    const _coins = Array.from({ length: numPlayers }, () => startCoins);

    // initialize turn order
    let _turnOrder = Array.from({ length: numPlayers }, (_, i) => i.toString());
    if (randomizeTurnOrder) {
      _turnOrder = random.Shuffle(_turnOrder);
    }

    // initialize landmark and establishment data
    const { estData, estDecks } = Est.initialize(version, expansions, supplyVariant, numPlayers);
    const { landData, landDeck } = Land.initialize(version, expansions, numPlayers);

    // initialize `G` object
    const G: MachikoroG = {
      version,
      expansions,
      supplyVariant,
      initialBuyRounds,
      _turnOrder,
      ...newTurnG,
      secret: { estDecks, landDeck },
      _coins,
      estData,
      landData,
      _logBuffer: [],
    };

    // shuffle decks
    for (let i = 0; i < G.secret.estDecks.length; i++) {
      G.secret.estDecks[i] = random.Shuffle(G.secret.estDecks[i]);
    }
    G.secret.landDeck = random.Shuffle(G.secret.landDeck);

    return G;
  },

  validateSetupData: validateSetupData,

  turn: {
    onBegin: ({ G, ctx }) => {
      const { phase } = ctx;

      Land.replenishSupply(G);
      Est.replenishSupply(G);
      Object.assign(G, newTurnG);

      if (phase === 'initialBuyPhase') {
        G.turnState = TurnState.Buy;
      }
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
    buyEst,
    buyLand,
    doTV,
    doOfficeGive,
    doOfficeTake,
    skipOffice,
    doDemolitionCompany,
    doMovingCompanyOpp,
    doRenovationCompany,
    investTechStartup,
    endTurn,
  },

  phases: {
    initialBuyPhase: {
      moves: {
        buyEst,
        buyLand,
        endTurn,
      },
      onBegin: ({ G, events }) => {
        // end phase immediately if no initial buying rounds
        if (G.initialBuyRounds === 0) {
          events.endPhase();
        }
      },
      start: true,
    },
  },

  plugins: [Log.LogxPlugin],

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  playerView: PlayerView.STRIP_SECRETS!,
};
