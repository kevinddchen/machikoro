//
// Game metadata for landmarks.
//

import { EstType } from '../establishments/types';
import { Landmark } from './types';

export const TrainStation: Landmark = {
  _id: 0,
  name: 'Train Station',
  description: 'You may throw 2 dice.',
  cost: 4,
};

export const ShoppingMall: Landmark = {
  _id: 1,
  name: 'Shopping Mall',
  description: 'Receive 1 more coin for each of your ' + EstType.Cup + ' and ' + EstType.Shop + ' establishments.',
  cost: 10,
};

export const AmusementPark: Landmark = {
  _id: 2,
  name: 'Amuse. Park',
  description: 'When you roll doubles, you gain an extra turn.',
  cost: 16,
};

export const RadioTower: Landmark = {
  _id: 3,
  name: 'Radio Tower',
  description: 'Once per turn, you may roll again.',
  cost: 22,
};

export const CityHall: Landmark = {
  _id: 4,
  name: 'City Hall',
  description: 'Immediately before buying establishments, if you have 0 coins, get 1 from the bank.',
  cost: 0,
};

export const Harbor: Landmark = {
  _id: 5,
  name: 'Harbor',
  description: 'If the dice total is 10 or more, you may add 2 to the total.',
  cost: 2,
};

export const Airport: Landmark = {
  _id: 6,
  name: 'Airport',
  description: 'If you build nothing on your turn, receive 10 coins from the bank.',
  cost: 30,
};

/**
 * Coins earned for City Hall's effect.
 */
export const CITY_HALL_EARNINGS = 1;

/**
 * Coins earned for Airport's effect.
 */
export const AIRPORT_EARNINGS = 10;

/**
 * List of all landmarks, and order they should be displayed.
 */
export const LANDMARKS: Landmark[] = [CityHall, Harbor, TrainStation, ShoppingMall, AmusementPark, RadioTower, Airport];

/**
 * List of all landmarks, sorted by ID.
 */
export const _LANDMARKS_BY_ID: Landmark[] = [...LANDMARKS].sort((a, b) => a._id - b._id);

/**
 * Landmarks used in the Base expansion.
 */
export const _BASE_LANDMARK_IDS: number[] = [0, 1, 2, 3];

/**
 * Landmarks used in the Harbor expansion.
 */
export const _HARBOR_LANDMARK_IDS: number[] = [0, 1, 2, 3, 4, 5, 6];

/**
 * Landmarks a player starts with.
 */
export const _STARTING_LANDMARK_IDS = [4];
