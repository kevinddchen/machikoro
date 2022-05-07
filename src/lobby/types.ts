/** 
 * Information needed by the client to authenticate API calls with server.
 */ 

/**
 * Information needed by the client to authenticate API calls with server.
 * @param matchID Random string that identifies the match the client is in.
 * @param playerID Player number of the client in the match. Takes values '0', '1', '2', ...
 * @param credentials Random string that authenticates client interactions with the server.
 */
export type ClientInfo = {
  matchID: string;
  playerID: string;
  credentials: string;
}