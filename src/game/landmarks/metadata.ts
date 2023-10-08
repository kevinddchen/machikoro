//
// Game metadata for landmarks.
//

import { Expansion, Version } from '../types';
import { EstType } from '../establishments/types';
import { Landmark } from './types';

export const CityHall: Landmark = {
  _id: 0,
  version: Version.MK1,
  expansion: Expansion.Harbor,
  name: 'City Hall',
  miniName: 'City Hall',
  description: 'Immediately before buying establishments, if you have 0 coins, get 1 coin from the bank.',
  coins: 1,
  cost: [0],
};

export const Harbor: Landmark = {
  _id: 1,
  version: Version.MK1,
  expansion: Expansion.Harbor,
  name: 'Harbor',
  miniName: 'Harbor',
  description: 'If the dice total is 10 or more, you may add 2 to the total.',
  coins: null,
  cost: [2],
};

export const TrainStation: Landmark = {
  _id: 2,
  version: Version.MK1,
  expansion: Expansion.Base,
  name: 'Train Station',
  miniName: 'Train Station',
  description: 'You may roll 2 dice.',
  coins: null,
  cost: [4],
};

export const ShoppingMall: Landmark = {
  _id: 3,
  version: Version.MK1,
  expansion: Expansion.Base,
  name: 'Shopping Mall',
  miniName: 'Shopping Mall',
  description: 'Your ' + EstType.Cup + ' and ' + EstType.Shop + ' establishments earn +1 coin when activated.',
  coins: 1, // bonus coins on establishment activation
  cost: [10],
};

export const AmusementPark: Landmark = {
  _id: 4,
  version: Version.MK1,
  expansion: Expansion.Base,
  name: 'Amusement Park',
  miniName: 'Amuse. Park',
  description: 'If you roll doubles, take another turn after this one.',
  coins: null,
  cost: [16],
};

export const RadioTower: Landmark = {
  _id: 5,
  version: Version.MK1,
  expansion: Expansion.Base,
  name: 'Radio Tower',
  miniName: 'Radio Tower',
  description: 'Once per turn, you may roll again.',
  coins: null,
  cost: [22],
};

export const Airport: Landmark = {
  _id: 6,
  version: Version.MK1,
  expansion: Expansion.Harbor,
  name: 'Airport',
  miniName: 'Airport',
  description: 'If you build nothing on your turn, get 10 coins from the bank.',
  coins: 10,
  cost: [30],
};

/**
 * List of all landmarks, and order they should be displayed.
 */
export const _LANDMARKS = [CityHall, Harbor, TrainStation, ShoppingMall, AmusementPark, RadioTower, Airport];

/**
 * Landmarks used in the Base expansion.
 */
export const _BASE_LANDMARKS = _LANDMARKS.filter((land) => land.expansion === Expansion.Base).map((land) => land._id);

/**
 * Landmarks added in the Harbor expansion.
 */
export const _HARBOR_LANDMARKS = _LANDMARKS
  .filter((land) => land.expansion === Expansion.Harbor)
  .map((land) => land._id);

/**
 * Additional landmarks a player starts with in the Harbor expansion.
 */
export const _HARBOR_STARTING_LANDMARKS = [CityHall._id];
