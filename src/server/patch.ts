/* eslint-disable */
// @ts-nocheck

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * NOTE: We want to modify the `/games/:name/:id/join` route to add some custom
 * logic when joining a match. We are unable to add middleware because the
 * request body can only be parsed once using `koaBody()`. For details, see:
 * - https://github.com/boardgameio/boardgame.io/issues/1107
 * - https://github.com/boardgameio/boardgame.io/issues/1143
 *
 * Until this issue is resolved, we are replacing the route by copying the code
 * from the repo and making the necessary changes.
 *
 * The code in this file were copied from:
 * - https://github.com/boardgameio/boardgame.io/blob/d97ef0b5500de8dec0ff6d503759dc4b36565622/src/server/api.ts
 * - https://github.com/boardgameio/boardgame.io/blob/d97ef0b5500de8dec0ff6d503759dc4b36565622/src/server/util.ts
 *
 * TODO(kevinddchen): Remove this file when the issue is resolved.
 */

import koaBody from 'koa-body';
import { nanoid } from 'nanoid';

import { createMatch } from 'boardgame.io/internal';

import { sanitizePlayerName, validatePlayerName } from './utils';

export const patchRoutes = (server: Any, games: Any): void => {
  const auth = server.auth;
  const db = server.db;
  const router = server.router;
  const uuid = () => nanoid(11);

  /**
   * Create a new match of a given game.
   *
   * @param {string} name - The name of the game of the new match.
   * @param {number} numPlayers - The number of players.
   * @param {object} setupData - User-defined object that's available
   *                             during game setup.
   * @param {boolean} unlisted - Whether the match should be excluded from public listing.
   * @return - The ID of the created match.
   */
  router.post('/games/:name/create', koaBody(), async (ctx) => {
    // The name of the game (for example: tic-tac-toe).
    const gameName = ctx.params.name;
    // User-data to pass to the game setup function.
    const setupData = ctx.request.body.setupData;
    // Whether the game should be excluded from public listing.
    const unlisted = ctx.request.body.unlisted;
    // The number of players for this game instance.
    const numPlayers = Number.parseInt(ctx.request.body.numPlayers);

    // added: Sanitize and validate player name.
    let playerName = ctx.request.body.playerName;
    playerName = sanitizePlayerName(playerName);
    validatePlayerName(ctx, playerName);
    // (end of added code)

    const game = games.find((g) => g.name === gameName);
    if (!game) ctx.throw(404, 'Game ' + gameName + ' not found');

    if (
      ctx.request.body.numPlayers !== undefined &&
      (Number.isNaN(numPlayers) ||
        (game.minPlayers && numPlayers < game.minPlayers) ||
        (game.maxPlayers && numPlayers > game.maxPlayers))
    ) {
      ctx.throw(400, 'Invalid numPlayers');
    }

    const matchID = await CreateMatch({
      ctx,
      db,
      game,
      numPlayers,
      setupData,
      uuid,
      unlisted,
    });

    const body: LobbyAPI.CreatedMatch = { matchID };
    ctx.body = body;
  });

  /**
   * Join a given match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @param {string} playerID - The ID of the player who joins. If not sent, will be assigned to the first index available.
   * @param {string} playerName - The name of the player who joins.
   * @param {object} data - The default data of the player in the match.
   * @return - Player ID and credentials to use when interacting in the joined match.
   */
  const joinMatch = async (ctx) => {
    let playerID = ctx.request.body.playerID;
    let playerName = ctx.request.body.playerName;
    const data = ctx.request.body.data;
    const matchID = ctx.params.id;

    if (!playerName) {
      ctx.throw(403, 'Player name is required.');
    }

    // added: Sanitize and validate player name.
    playerName = sanitizePlayerName(playerName);
    validatePlayerName(ctx, playerName);
    // (end of added code)

    const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });
    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }

    // added: Check for duplicate player names.
    for (const player of Object.values(metadata.players)) {
      if (player.name && player.name === playerName) {
        ctx.throw(409, 'Player name already taken');
      }
    }
    // (end of added code)

    if (typeof playerID === 'undefined' || playerID === null) {
      playerID = getFirstAvailablePlayerID(metadata.players);
      if (playerID === undefined) {
        const numPlayers = getNumPlayers(metadata.players);
        ctx.throw(409, `Match ${matchID} reached maximum number of players (${numPlayers})`);
      }
    }

    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (metadata.players[playerID].name) {
      ctx.throw(409, 'Player ' + playerID + ' not available');
    }

    if (data) {
      metadata.players[playerID].data = data;
    }
    metadata.players[playerID].name = playerName;
    const playerCredentials = await auth.generateCredentials(ctx);
    metadata.players[playerID].credentials = playerCredentials;

    await db.setMetadata(matchID, metadata);

    const body: LobbyAPI.JoinedMatch = { playerID, playerCredentials };
    ctx.body = body;
  };

  // patch routes
  router.post('/games/:name/create', koaBody(), createMatch);
  router.post('/games/:name/:id/join', koaBody(), joinMatch);
};

/**
 * Creates a new match.
 *
 * @param {object} db - The storage API.
 * @param {object} game - The game config object.
 * @param {number} numPlayers - The number of players.
 * @param {object} setupData - User-defined object that's available
 *                             during game setup.
 * @param {object } lobbyConfig - Configuration options for the lobby.
 * @param {boolean} unlisted - Whether the match should be excluded from public listing.
 */
const CreateMatch = async ({
  ctx,
  db,
  uuid,
  ...opts
}: {
  db: StorageAPI.Sync | StorageAPI.Async;
  ctx: Koa.BaseContext;
  uuid: () => string;
} & Parameters<typeof createMatch>[0]): Promise<string> => {
  const matchID = uuid();
  const match = createMatch(opts);

  if ('setupDataError' in match) {
    ctx.throw(400, match.setupDataError);
  } else {
    await db.createMatch(matchID, match);
    return matchID;
  }
};

/**
 * Given players, returns the count of players.
 */
const getNumPlayers = (players: Server.MatchData['players']): number => Object.keys(players).length;

/**
 * Given players, tries to find the ID of the first player that can be joined.
 * Returns `undefined` if there’s no available ID.
 */
const getFirstAvailablePlayerID = (players: Server.MatchData['players']): string | undefined => {
  const numPlayers = getNumPlayers(players);
  // Try to get the first index available
  for (let i = 0; i < numPlayers; i++) {
    if (typeof players[i].name === 'undefined' || players[i].name === null) {
      return String(i);
    }
  }
};
