/**
 * Handles match credentials via local storage
 */

class Authenticator {

  saveCredentials(matchID, playerID, credentials) {
    const storageString = playerID.toString() + credentials;
    localStorage.setItem(matchID, storageString);
  }

  hasCredentials(matchID) {
    return localStorage.getItem(matchID) ? true : false;
  }

  fetchCredentials(matchID) {
    const storageString = localStorage.getItem(matchID);
    if (!storageString) {
      return {};
    } else {
      const playerID = storageString.slice(0, 1);
      const credentials = storageString.slice(1);
      return { playerID, credentials };
    }
  }

  deleteCredentials(matchID) {
    localStorage.removeItem(matchID);
  }

}

export default Authenticator;