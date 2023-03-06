import { MatchInfo } from './types';

/**
 * Internal version number for the authentication system. Bump this number to
 * clear all previously stored credentials from the client browser.
 */
const AUTH_VERSION = 2;

/**
 * Key where the authentication version is stored in local storage.
 */
const AUTH_VERSION_KEY = 'auth_version';

/**
 * Handles match info storage and retrieval on client browser.
 */
export default class Authenticator {
  constructor() {
    // if the client is using an older version of the authentication system,
    // clear all stored credentials and update the version number
    const client_version = this.fetchAuthVersion();
    const this_version = AUTH_VERSION;
    if (client_version < this_version) {
      this.clearAllMatchInfo();
      this.setAuthVersion();
    }
  }

  /**
   * @returns Client's version of the authentication system.
   */
  fetchAuthVersion(): number {
    const version = localStorage.getItem(AUTH_VERSION_KEY);
    return version ? parseInt(version) : 0;
  }

  /**
   * Update client's version of the authentication system.
   */
  setAuthVersion(): void {
    localStorage.setItem(AUTH_VERSION_KEY, AUTH_VERSION.toString());
  }

  /**
   * Save info for a match.
   * @param matchInfo
   */
  saveMatchInfo(matchInfo: MatchInfo): void {
    const { matchID, playerID, credentials } = matchInfo;
    // credentials use the characters [a-zA-Z0-9_-]
    const storageString = playerID + '.' + credentials;
    localStorage.setItem(matchID, storageString);
  }

  /**
   * @param matchID
   * @returns True if client has saved info for the match.
   */
  hasMatchInfo(matchID: string): boolean {
    return localStorage.getItem(matchID) !== null;
  }

  /**
   * @param matchID
   * @returns Client's saved info for a match, if it exists.
   */
  fetchMatchInfo(matchID: string): MatchInfo | null {
    const storageString = localStorage.getItem(matchID);
    if (storageString === null) {
      return null;
    }
    const split = storageString.split('.');
    const playerID = split[0];
    const credentials = split[1];
    return { matchID, playerID, credentials };
  }

  /**
   * Delete info for a match.
   * @param matchID
   */
  deleteMatchInfo(matchID: string): void {
    localStorage.removeItem(matchID);
  }

  /**
   * Delete all saved match info.
   */
  clearAllMatchInfo(): void {
    localStorage.clear();
  }
}
