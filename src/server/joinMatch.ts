// @ts-nocheck

/**
 * NOTE: We want to modify the `/games/:name/:id/join` route to add some custom
 * logic when joining a match. We are unable to add middleware because the
 * request body can only be parsed once using `koaBody`. For more details, see
 * https://github.com/boardgameio/boardgame.io/issues/1107.
 *
 * Until this issue is resolved, we are replacing the route by copying the code
 * from the repo and making the necessary changes.
 *
 * The code in this file were copied from:
 * https://github.com/boardgameio/boardgame.io/blob/d97ef0b5500de8dec0ff6d503759dc4b36565622/src/server/api.ts
 * https://github.com/boardgameio/boardgame.io/blob/d97ef0b5500de8dec0ff6d503759dc4b36565622/src/server/util.ts
 * 
 * TODO: Remove this file when the issue is resolved.
 */

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import koaBody from 'koa-body';

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

/**
 * Replace `/games/:name/:id/join` route.
 * @param server
 */
export const customJoinMatch = (server: Server): void => {
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
  server.router.post('/games/:name/:id/join', koaBody(), async (ctx) => {
    let playerID = ctx.request.body.playerID;
    const playerName = ctx.request.body.playerName;
    const data = ctx.request.body.data;
    const matchID = ctx.params.id;

    if (!playerName) {
      ctx.throw(403, 'Player name is required');
    }

    const { metadata } = await (server.db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });
    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }

    for (const player of Object.values(metadata.players)) {
      if (player.name && player.name === playerName) {
        ctx.throw(409, 'Player name already taken');
      }
    }

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
    const playerCredentials = await server.auth.generateCredentials(ctx);
    metadata.players[playerID].credentials = playerCredentials;

    await server.db.setMetadata(matchID, metadata);

    const body: LobbyAPI.JoinedMatch = { playerID, playerCredentials };
    ctx.body = body;
  });
};
