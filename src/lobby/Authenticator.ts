/**
 * Handles match credentials storage and retrieval on client browser.
 */
export default class Authenticator {

  /**
   * Save credentials for a match to local storage.
   * @param matchID Must be unique.
   * @param playerID Must be a single character.
   * @param credentials
   */
  saveCredentials (matchID: string, playerID: string, credentials: string): void {
    const storageString = playerID + credentials;
    localStorage.setItem(matchID, storageString);
  }

  /**
   * Check if local storage contains credentials for a match.
   * @param matchID
   * @returns True if credentials are stored.
   */
  hasCredentials (matchID: string): boolean {
    return localStorage.getItem(matchID) ? true : false;
  }

  /**
   * Retrieve credentials for a match from local storage, if any.
   * @param matchID
   * @returns
   */
  fetchCredentials (matchID: string): { playerID?: string, credentials?: string } {
    const storageString = localStorage.getItem(matchID);
    if (!storageString) {
      return {};
    } else {
      const playerID = storageString.slice(0, 1);
      const credentials = storageString.slice(1);
      return { playerID, credentials };
    }
  }

  /**
   * Delete credentials for a match from local storage.
   * @param matchID
   */
  deleteCredentials (matchID: string): void {
    localStorage.removeItem(matchID);
  }

}
