//
// Game metadata for Machi Koro 2 landmarks.
//

import { EstType } from '../establishments/types';
import { Landmark } from './types';

export const CityHall2: Landmark = {
  _id: 0,
  name: 'City Hall',
  description: 'Immediately before buying establishments, if you have 0 coins, receive 1 coin from the bank.',
  coins: 1,
  cost: [0, 0, 0],
};

export const LoanOffice2: Landmark = {
  _id: 1,
  name: 'Loan Office',
  description:
    'You can only build this landmark when you are the only player with no landmarks. ' +
    'Reduce the build cost of all landmarks by 2 coins (builder only).',
  coins: 2, // discount on landmarks
  cost: [10, 10, 10],
};

export const FarmersMarket2: Landmark = {
  _id: 2,
  name: 'Farmers Market',
  description: 'Your ' + EstType.Wheat + ' establishments earn +1 coin when activated (all players).',
  coins: 1, // bonus coins on establishment activation
  cost: [10, 14, 22],
};

export const FrenchRestaurant2: Landmark = {
  _id: 3,
  name: 'French Restaurant',
  description: 'Take 2 coins from each opponent (builder only; occurs once).',
  coins: 2,
  cost: [10, 14, 22],
};

export const MovingCompany2: Landmark = {
  _id: 4,
  name: 'Moving Company',
  description: 'If you roll doubles, give 1 establishment to the previous player (all players).',
  coins: null,
  cost: [10, 14, 22],
};

export const Observatory2: Landmark = {
  _id: 5,
  name: 'Observatory',
  description: 'Reduce the build cost of "Launch Pad" by 5 coins (all players).',
  coins: 5, // discount on landmark
  cost: [10, 14, 22],
};

export const Publisher2: Landmark = {
  _id: 6,
  name: 'Publisher',
  description:
    'Take 1 coin from each opponent for each ' + EstType.Shop + ' establishment they own (builder only; occurs once).',
  coins: 1, // coins taken per Shop establishment
  cost: [10, 14, 22],
};

export const ShoppingMall2: Landmark = {
  _id: 7,
  name: 'Shopping Mall',
  description: 'Your ' + EstType.Shop + ' establishments earn +1 coin when activated (all players).',
  coins: 1, // bonus coins on establishment activation
  cost: [10, 14, 22],
};

export const TechStartup: Landmark = {
  _id: 8,
  name: 'Tech Startup',
  description: 'If you roll 12, receive 8 coins from the bank (all players).',
  coins: 8,
  cost: [10, 14, 22],
};

export const Airport2: Landmark = {
  _id: 9,
  name: 'Airport',
  description: 'If you build nothing on your turn, receive 5 coins from the bank (all players).',
  coins: 5,
  cost: [12, 16, 22],
};

export const AmusementPark2: Landmark = {
  _id: 10,
  name: 'Amusement Park',
  description: 'If you roll doubles, take an extra turn (all players).',
  coins: null,
  cost: [12, 16, 22],
};

export const Charterhouse2: Landmark = {
  _id: 11,
  name: 'Charterhouse',
  description: 'If you rolled 2 dice and received no coins, receive 3 coins from the bank (all players).',
  coins: 3,
  cost: [12, 16, 22],
};

export const ExhibitHall2: Landmark = {
  _id: 12,
  name: 'Exhibit Hall',
  description: 'From each opponent who has more than 10 coins, take half, rounded down (builder only; occurs once).',
  coins: 0, // (special case)
  cost: [12, 16, 22],
};

export const Forge2: Landmark = {
  _id: 13,
  name: 'Forge',
  description: 'Your ' + EstType.Gear + ' establishments earn +1 coin when activated (all players).',
  coins: 1, // bonus coins on establishment activation
  cost: [12, 16, 22],
};

export const Museum2: Landmark = {
  _id: 14,
  name: 'Museum',
  description: 'Take 3 coins from each opponent for each landmark they own (builder only; occurs once).',
  coins: 3, // coins taken per landmark
  cost: [12, 16, 22],
};

export const Park2: Landmark = {
  _id: 15,
  name: 'Park',
  description:
    "Redistribute all players' coins as evenly as possible, making up any difference with coins from the bank (occurs once).",
  coins: null,
  cost: [12, 16, 22],
};

export const RadioTower2: Landmark = {
  _id: 16,
  name: 'Radio Tower',
  description: 'Take another turn (builder only; occurs once).',
  coins: null,
  cost: [12, 16, 22],
};

export const SodaBottlingPlant2: Landmark = {
  _id: 17,
  name: 'Soda Bottling Plant',
  description: 'Your ' + EstType.Cup + ' establishments earn +1 coin when activated (all players).',
  coins: 1, // bonus coins on establishment activation
  cost: [12, 16, 22],
};

export const Temple2: Landmark = {
  _id: 18,
  name: 'Temple',
  description: 'If you roll doubles, take 2 coins from each opponent (all players).',
  coins: 2,
  cost: [12, 16, 22],
};

export const TVStation2: Landmark = {
  _id: 19,
  name: 'TV Station',
  description:
    'Take 1 coin from each opponent for each ' + EstType.Cup + ' establishment they own (builder only; occurs once).',
  coins: 1, // coins taken per Cup establishment
  cost: [12, 16, 22],
};

export const LaunchPad: Landmark = {
  _id: 20,
  name: 'Launch Pad',
  description: 'You win the game! (builder only)',
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
  TechStartup,
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
  LaunchPad,
];

/**
 * Landmarks used in Machi Koro 2.
 */
export const _MK2_LANDMARKS: number[] = _LANDMARKS2.map((landmark) => landmark._id);

/**
 * Landmarks a player starts with in Machi Koro 2.
 */
export const _STARTING_LANDMARKS2 = [CityHall2._id];