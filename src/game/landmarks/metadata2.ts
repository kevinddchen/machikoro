//
// Game metadata for Machi Koro 2 landmarks.
//

import { EstType } from '../establishments/types';
import { Landmark } from './types';

export const CityHall2: Landmark = {
  _id: 0,
  name: 'City Hall',
  miniName: 'City Hall',
  description: 'Immediately before buying establishments, if you have 0 coins, receive 1 coin from the bank.',
  coins: 1,
  cost: [0],
};

export const LoanOffice2: Landmark = {
  _id: 1,
  name: 'Loan Office',
  miniName: 'Loan Office',
  description:
    'You can only build this landmark when you are the only player with no landmarks. ' +
    'Reduce the build cost of all landmarks by 2 coins (builder only).',
  coins: 2, // discount on landmarks
  cost: [10],
};

export const FarmersMarket2: Landmark = {
  _id: 2,
  name: 'Farmers Market',
  miniName: 'Farmers Mkt.',
  description: 'Your ' + EstType.Wheat + ' establishments earn +1 coin when activated (all players).',
  coins: 1, // bonus coins on establishment activation
  cost: [10, 14, 22],
};

export const FrenchRestaurant2: Landmark = {
  _id: 3,
  name: 'French Restaurant',
  miniName: 'French Rest.',
  description: 'Take 2 coins from each opponent (builder only).',
  coins: 2,
  cost: [10, 14, 22],
};

export const MovingCompany2: Landmark = {
  _id: 4,
  name: 'Moving Company',
  miniName: 'Moving Co.',
  description: 'If you roll doubles, give 1 establishment to the previous player (all players).',
  coins: null,
  cost: [10, 14, 22],
};

export const Observatory2: Landmark = {
  _id: 5,
  name: 'Observatory',
  miniName: 'Observatory',
  description: 'Reduce the build cost of "Launch Pad" by 5 coins (all players).',
  coins: 5, // discount on landmark
  cost: [10, 14, 22],
};

export const Publisher2: Landmark = {
  _id: 6,
  name: 'Publisher',
  miniName: 'Publisher',
  description:
    'Take 1 coin from each opponent for each ' + EstType.Shop + ' establishment they own (builder only).',
  coins: 1, // coins taken per Shop establishment
  cost: [10, 14, 22],
};

export const ShoppingMall2: Landmark = {
  _id: 7,
  name: 'Shopping Mall',
  miniName: 'Shopping Mall',
  description: 'Your ' + EstType.Shop + ' establishments earn +1 coin when activated (all players).',
  coins: 1, // bonus coins on establishment activation
  cost: [10, 14, 22],
};

export const TechStartup2: Landmark = {
  _id: 8,
  name: 'Tech Startup',
  miniName: 'Tech Startup',
  description: 'If you roll 12, receive 8 coins from the bank (all players).',
  coins: 8,
  cost: [10, 14, 22],
};

export const Airport2: Landmark = {
  _id: 9,
  name: 'Airport',
  miniName: 'Airport',
  description: 'If you build nothing on your turn, receive 5 coins from the bank (all players).',
  coins: 5,
  cost: [12, 16, 22],
};

export const AmusementPark2: Landmark = {
  _id: 10,
  name: 'Amusement Park',
  miniName: 'Amuse. Park',
  description: 'If you roll doubles, take another turn after this one (all players).',
  coins: null,
  cost: [12, 16, 22],
};

export const Charterhouse2: Landmark = {
  _id: 11,
  name: 'Charterhouse',
  miniName: 'Charterhouse',
  description: 'If you roll 2 dice and receive no coins, receive 3 coins from the bank (all players).',
  coins: 3,
  cost: [12, 16, 22],
};

export const ExhibitHall2: Landmark = {
  _id: 12,
  name: 'Exhibit Hall',
  miniName: 'Exhibit Hall',
  description: 'From each opponent who has more than 10 coins, take half, rounded down (builder only).',
  coins: 10, // This is not the coins taken, but the threshold for triggering the tax office
  cost: [12, 16, 22],
};

export const Forge2: Landmark = {
  _id: 13,
  name: 'Forge',
  miniName: 'Forge',
  description: 'Your ' + EstType.Gear + ' establishments earn +1 coin when activated (all players).',
  coins: 1, // bonus coins on establishment activation
  cost: [12, 16, 22],
};

export const Museum2: Landmark = {
  _id: 14,
  name: 'Museum',
  miniName: 'Museum',
  description: 'Take 3 coins from each opponent for each landmark they own (builder only).',
  coins: 3, // coins taken per landmark
  cost: [12, 16, 22],
};

export const Park2: Landmark = {
  _id: 15,
  name: 'Park',
  miniName: 'Park',
  description:
    "Redistribute all players' coins as evenly as possible, making up any difference with coins from the bank.",
  coins: null,
  cost: [12, 16, 22],
};

export const RadioTower2: Landmark = {
  _id: 16,
  name: 'Radio Tower',
  miniName: 'Radio Tower',
  description: 'Take another turn after this one (builder only).',
  coins: null,
  cost: [12, 16, 22],
};

export const SodaBottlingPlant2: Landmark = {
  _id: 17,
  name: 'Soda Bottling Plant',
  miniName: 'Soda Bt. Plant',
  description: 'Your ' + EstType.Cup + ' establishments earn +1 coin when activated (all players).',
  coins: 1, // bonus coins on establishment activation
  cost: [12, 16, 22],
};

export const Temple2: Landmark = {
  _id: 18,
  name: 'Temple',
  miniName: 'Temple',
  description: 'If you roll doubles, take 2 coins from each opponent (all players).',
  coins: 2,
  cost: [12, 16, 22],
};

export const TVStation2: Landmark = {
  _id: 19,
  name: 'TV Station',
  miniName: 'TV Station',
  description:
    'Take 1 coin from each opponent for each ' + EstType.Cup + ' establishment they own (builder only).',
  coins: 1, // coins taken per Cup establishment
  cost: [12, 16, 22],
};

export const LaunchPad2: Landmark = {
  _id: 20,
  name: 'Launch Pad',
  miniName: 'Launch Pad',
  description: 'You win the game!',
  coins: null,
  cost: [45, 38, 25],
};

/**
 * List of all landmarks in Machi Koro 2, and order they should be displayed.
 */
export const _LANDMARKS2 = [
  CityHall2,
  LoanOffice2,
  FarmersMarket2,
  FrenchRestaurant2,
  MovingCompany2,
  Observatory2,
  Publisher2,
  ShoppingMall2,
  TechStartup2,
  Airport2,
  AmusementPark2,
  Charterhouse2,
  ExhibitHall2,
  Forge2,
  Museum2,
  Park2,
  RadioTower2,
  SodaBottlingPlant2,
  Temple2,
  TVStation2,
  LaunchPad2,
];

/**
 * Landmarks used in Machi Koro 2.
 */
export const _MK2_LANDMARKS: number[] = _LANDMARKS2.map((landmark) => landmark._id);

/**
 * Landmarks a player starts with in Machi Koro 2.
 */
export const _MK2_STARTING_LANDMARKS = [CityHall2._id];

/**
 * Maximum number of unique landmarks in the supply for Machi Koro 2.
 */
export const _SUPPY_LIMIT_LANDMARK = 5;
