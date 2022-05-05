/** 
 * Information needed by the client to authenticate API calls with server.
 */ 

/**
 * Information needed by the client to authenticate API calls with server.
 * @param matchID Internal random string identifier for the match.
 * @param playerID Seat of the player, taking values '0', '1', '2', ...
 * @param credentials Authentication token.
 */
export type ClientInfo = {
  matchID: string;
  playerID: string;
  credentials: string;
}