//
// Metadata for landmarks.
//

import type { Landmark } from './types';

export const TrainStation: Landmark = {
  _id: 0,
  name: 'Train Station',
  description: '',
  cost: 4,
  imageFilename: 'land0.gif',
};

export const ShoppingMall: Landmark = {
  _id: 1,
  name: 'Shopping Mall',
  description: '',
  cost: 10,
  imageFilename: 'land1.gif',
};

export const AmusementPark: Landmark = {
  _id: 2,
  name: 'Amusement Park',
  description: '',
  cost: 16,
  imageFilename: 'land2.gif',
};

export const RadioTower: Landmark = {
  _id: 3,
  name: 'Radio Tower',
  description: '',
  cost: 22,
  imageFilename: 'land3.gif',
};

export const Harbor: Landmark = {
  _id: 4,
  name: 'Harbor',
  description: '',
  cost: 2,
  imageFilename: 'land5.png',
};

export const Airport: Landmark = {
  _id: 5,
  name: 'Airport',
  description: '',
  cost: 30,
  imageFilename: 'land6.png',
};

/**
 * List of all landmarks, and order they should be displayed.
 */
export const LANDMARKS: Landmark[] = [Harbor, TrainStation, ShoppingMall, AmusementPark, RadioTower, Airport];

/*
 * Landmarks used in the Base expansion.
 */
export const BASE_LANDMARK_IDS: number[] = [0, 1, 2, 3];

/*
 * Landmarks used in the Harbor expansion.
 */
export const HARBOR_LANDMARK_IDS: number[] = [0, 1, 2, 3, 4, 5];
