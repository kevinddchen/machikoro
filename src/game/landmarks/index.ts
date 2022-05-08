import * as metadata from './metadata';
import { Expansion } from '../enums';
import { Landmark, LandmarkData } from '../types';

export * from './metadata';

/*

Abstraction for landmarks.

*/

// this array is used for id -> landmark lookup
// const all_landmarks_by_id = [...metadata.all_landmarks].sort((a, b) => a._id - b._id);

/**
 * @param a
 * @param b
 * @returns True if the landmarks are the same.
 */
 export const isEqual = (a: Landmark, b: Landmark): boolean => {
  return a._id === b._id;
};

/**
 * @param data 
 * @param land Landmark.
 * @returns True if the landmark is in use for this game.
 */
export const isInUse = (data: LandmarkData, land: Landmark): boolean => {
  return data._in_use[land._id];
};

/**
 * @param data 
 * @param player Player ID. 
 * @param land Landmark.
 * @returns True if this landmark is owned by this player.
 */
export const isOwned = (data: LandmarkData, player: number, land: Landmark): boolean => {
  return data._owned[player][land._id];
};

/**
 * @param data 
 * @returns All landmarks that are in use for this game. 
 */
export const getAllInUse = (data: LandmarkData): Landmark[] => {
  const all: Landmark[] = [];
  for (const land of metadata.all_landmarks)
    if (data._in_use[land._id])
      all.push(land);
  return all;
};

/**
 * @param data 
 * @param player Player ID. 
 * @returns All landmarks owned by this player.
 */
export const getAllOwned = (data: LandmarkData, player: number): Landmark[] => {
  const all: Landmark[] = [];
  for (const land of metadata.all_landmarks)
    if (data._owned[player][land._id])
      all.push(land);
  return all;
};

/**
 * Update `LandmarkData` for a player buying an landmark.
 * @param data 
 * @param player Player ID.
 * @param land Landmark.
 */
export const buy = (data: LandmarkData, player: number, land: Landmark): void => {
  data._owned[player][land._id] = true;
};

// Initialization ------------------------------------

/**
 * Initialize the landmark data for a game.
 * @param expansion Expansion.
 * @param numPlayers Number of players.
 * @returns The `LandmarkData` for the game, which is an object that is
 *  passed between the client and server.
 */
export const initialize = (expansion: Expansion, numPlayers: number): LandmarkData => {

  // declare empty data structure
  const total_count = metadata.all_landmarks.length;
  let data: LandmarkData = {
    _in_use: Array(total_count).fill(false),
    _owned: Array(numPlayers).fill(Array(total_count).fill(false)), 
  };

  // get landmarks in use
  let in_use_ids: number[];
  switch (expansion) {

    case Expansion.Base:
      in_use_ids = metadata.base_landmark_ids;
      break;

    case Expansion.Harbor:
      in_use_ids = metadata.harbor_landmark_ids;
      break;

    default:
      throw new Error(`Expansion "${Expansion[expansion]}" not implemented.`);
  }

  // populate `LandmarkData`
  for (const id of in_use_ids) 
    data._in_use[id] = true;

  return data;
};
