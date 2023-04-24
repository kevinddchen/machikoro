//
// Types for matches.
//

/**
 * Information a client needs to connect to a match.
 * @prop {string} matchID - Identifies the match.
 * @prop {string} playerID - Player number in the match, e.g. '0', '1', '2', ...
 * @prop {string} credentials - Token to authenticate interactions with server.
 */
export interface MatchInfo {
  matchID: string;
  playerID: string;
  credentials: string;
}

export const debugMatchInfo: MatchInfo = {
  matchID: '',
  playerID: '',
  credentials: '',
};
