/**
 * Handles match credentials storage and retrieval on client browser.
 */
class Authenticator {
  /**
   * Save credentials for a match to local storage.
   * @param {string} matchID
   * @param {string} playerID
   * @param {string} credentials
   */
  saveCredentials (matchID, playerID, credentials) {
    const storageString = playerID.toString() + credentials;
    localStorage.setItem(matchID, storageString);
  }

  /**
   * Check if local storage contains credentials for a match.
   * @param {string} matchID
   * @returns {boolean}
   */
  hasCredentials (matchID) {
    return localStorage.getItem(matchID) ? true : false;
  }

  /**
   * Retrieve credentials for a match from local storage, if any.
   * @param {string} matchID
   * @returns {object} containing `playerID` and `credentials`.
   */
  fetchCredentials (matchID) {
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
   * @param {string} matchID
   */
  deleteCredentials (matchID) {
    localStorage.removeItem(matchID);
  }
}

export default Authenticator;
