//
// Game metadata for Machi Koro 2 establishments.
//

import { EstColor, EstType, Establishment } from './types';

export const SushiBar2: Establishment = {
  _id: 0,
  _expId: 1,
  name: 'Sushi Bar',
  description: 'Take 3 coins from the player who just rolled.',
  cost: 2,
  earn: 3,
  rolls: [1],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 5,
};

export const WheatField2: Establishment = {
  _id: 1,
  _expId: 1,
  name: 'Wheat Field',
  description: 'Receive 1 coin from the bank.',
  cost: 1,
  earn: 1,
  rolls: [1, 2],
  color: EstColor.Blue,
  type: EstType.Wheat,
  _initial: 5,
};

export const Vineyard2: Establishment = {
  _id: 2,
  _expId: 1,
  name: 'Vineyard',
  description: 'Receive 2 coins from the bank.',
  cost: 1,
  earn: 2,
  rolls: [2],
  color: EstColor.Blue,
  type: EstType.Fruit,
  _initial: 5,
};

export const Bakery2: Establishment = {
  _id: 3,
  _expId: 1,
  name: 'Bakery',
  description: 'Receive 2 coins from the bank.',
  cost: 1,
  earn: 2,
  rolls: [2, 3],
  color: EstColor.Green,
  type: EstType.Shop,
  _initial: 5,
};

export const Cafe2: Establishment = {
  _id: 4,
  _expId: 1,
  name: 'Cafe',
  description: 'Take 2 coins from the player who just rolled.',
  cost: 1,
  earn: 2,
  rolls: [3],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 5,
};

export const FlowerGarden2: Establishment = {
  _id: 5,
  _expId: 1,
  name: 'Flower Garden',
  description: 'Receive 2 coins from the bank.',
  cost: 2,
  earn: 2,
  rolls: [4],
  color: EstColor.Blue,
  type: null,
  _initial: 5,
};

export const ConvenienceStore2: Establishment = {
  _id: 6,
  _expId: 1,
  name: 'Convenience Store',
  description: 'Receive 3 coins from the bank.',
  cost: 1,
  earn: 3,
  rolls: [4],
  color: EstColor.Green,
  type: EstType.Shop,
  _initial: 5,
};

export const Forest2: Establishment = {
  _id: 7,
  _expId: 1,
  name: 'Forest',
  description: 'Receive 2 coins from the bank.',
  cost: 3,
  earn: 2,
  rolls: [5],
  color: EstColor.Blue,
  type: EstType.Gear,
  _initial: 5,
};

export const FlowerShop2: Establishment = {
  _id: 8,
  _expId: 1,
  name: 'Flower Shop',
  description: 'Receive 3 coins from the bank for each "Flower Garden" establishment you own.',
  cost: 1,
  earn: 3, // coins earned per `FlowerGarden2` establishment
  rolls: [6],
  color: EstColor.Green,
  type: null,
  _initial: 3,
};

export const Office2: Establishment = {
  _id: 9,
  _expId: 1,
  name: 'Business Center',
  description: 'You may exchange an establishment with an opponent.',
  cost: 3,
  earn: 0,
  rolls: [6],
  color: EstColor.Purple,
  type: null,
  _initial: 3,
};

export const CornField2: Establishment = {
  _id: 10,
  _expId: 1,
  name: 'Corn Field',
  description: 'Receive 3 coins from the bank.',
  cost: 2,
  earn: 3,
  rolls: [7],
  color: EstColor.Blue,
  type: EstType.Wheat,
  _initial: 5,
};

export const Stadium2: Establishment = {
  _id: 11,
  _expId: 1,
  name: 'Stadium',
  description: 'Take 3 coins from each opponent.',
  cost: 3,
  earn: 3,
  rolls: [7],
  color: EstColor.Purple,
  type: null,
  _initial: 3,
};

export const HamburgerStand2: Establishment = {
  _id: 12,
  _expId: 1,
  name: 'Hamburger Stand',
  description: 'Take 2 coins from the player who just rolled.',
  cost: 1,
  earn: 2,
  rolls: [8],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 5,
};

export const FurnitureFactory2: Establishment = {
  _id: 13,
  _expId: 1,
  name: 'Furniture Factory',
  description: 'Receive 4 coins from the bank for each ' + EstType.Gear + ' establishment you own.',
  cost: 4,
  earn: 4, // coins earned per Gear establishment
  rolls: [8],
  color: EstColor.Green,
  type: null,
  _initial: 3,
};

export const TaxOffice2: Establishment = {
  _id: 14,
  _expId: 1,
  name: 'Shopping District',
  description: 'From each opponent who has more than 10 coins, take half, rounded down.',
  cost: 3,
  earn: 10, // This is not the coins taken, but the threshold for triggering the tax office
  rolls: [8, 9],
  color: EstColor.Purple,
  type: null,
  _initial: 3,
};

export const FamilyRestaurant2: Establishment = {
  _id: 15,
  _expId: 1,
  name: 'Family Restaurant',
  description: 'Take 2 coins from the player who just rolled.',
  cost: 2,
  earn: 2,
  rolls: [9, 10],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 5,
};

export const Winery2: Establishment = {
  _id: 16,
  _expId: 1,
  name: 'Winery',
  description: 'Receive 3 coins from the bank for each ' + EstType.Fruit + ' establishment you own.',
  cost: 3,
  earn: 3, // coins earned per Fruit establishment
  rolls: [9],
  color: EstColor.Green,
  type: null,
  _initial: 3,
};

export const AppleOrchard2: Establishment = {
  _id: 17,
  _expId: 1,
  name: 'Apple Orchard',
  description: 'Receive 3 coins from the bank.',
  cost: 1,
  earn: 3,
  rolls: [10],
  color: EstColor.Blue,
  type: EstType.Fruit,
  _initial: 5,
};

export const FoodWarehouse2: Establishment = {
  _id: 18,
  _expId: 1,
  name: 'Food Warehouse',
  description: 'Receive 2 coins from the bank for each ' + EstType.Cup + ' establishment you own.',
  cost: 2,
  earn: 2, // coins earned per Cup establishment
  rolls: [10, 11],
  color: EstColor.Green,
  type: null,
  _initial: 3,
};

export const Mine2: Establishment = {
  _id: 19,
  _expId: 1,
  name: 'Mine',
  description: 'Receive 6 coins from the bank.',
  cost: 4,
  earn: 6,
  rolls: [11, 12],
  color: EstColor.Blue,
  type: EstType.Gear,
  _initial: 5,
};

/**
 * List of all establishments in Machi Koro 2, and order they should be displayed.
 */
export const _ESTABLISHMENTS2 = [
  SushiBar2,
  WheatField2,
  Vineyard2,
  Bakery2,
  Cafe2,
  FlowerGarden2,
  ConvenienceStore2,
  Forest2,
  FlowerShop2,
  Office2,
  CornField2,
  Stadium2,
  HamburgerStand2,
  FurnitureFactory2,
  TaxOffice2,
  FamilyRestaurant2,
  Winery2,
  AppleOrchard2,
  FoodWarehouse2,
  Mine2,
];

/**
 * Establishments used in Machi Koro 2.
 */
export const _MK2_ESTABLISHMENTS = _ESTABLISHMENTS2.map((est) => est._id);

/**
 * Establishments a player starts with in Machi Koro 2.
 */
export const _MK2_STARTING_ESTABLISHMENTS: number[] = [];
