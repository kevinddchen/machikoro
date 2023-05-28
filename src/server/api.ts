import { SetupData } from 'game';

/**
 * API for creating a match.
 * @prop {string} playerName - Name of the player. This is not needed by
 * boardgame.io's API, but we add middleware to validate the player name.
 * @prop {number} numPlayers
 * @prop {SetupData} setupData
 */
export interface createMatchAPI {
  playerName: string;
  numPlayers: number;
  setupData: SetupData;
}

/**
 * API for joining a match.
 * @prop {string} playerName
 */
export interface joinMatchAPI {
  playerName: string;
}
