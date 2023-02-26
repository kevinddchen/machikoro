//
// Game metadata for Machi Koro 2 establishments.
//

import { EstColor, EstType, Establishment } from './types';

export const SushiBar2: Establishment = {
  _id: 0,
  name: 'Sushi Bar',
  description: 'Take 3 coins from the player who just rolled.',
  cost: 2,
  earn: 3,
  rolls: [1],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const WheatField2: Establishment = {
  _id: 1,
  name: 'Wheat Field',
  description: 'Receive 1 coin from the bank.',
  cost: 1,
  earn: 1,
  rolls: [1, 2],
  color: EstColor.Blue,
  type: EstType.Wheat,
};

export const Vineyard2: Establishment = {
  _id: 2,
  name: 'Vineyard',
  description: 'Receive 2 coins from the bank.',
  cost: 1,
  earn: 2,
  rolls: [2],
  color: EstColor.Blue,
  type: EstType.Fruit,
};

export const Bakery2: Establishment = {
  _id: 3,
  name: 'Bakery',
  description: 'Receive 2 coins from the bank.',
  cost: 1,
  earn: 2,
  rolls: [2, 3],
  color: EstColor.Green,
  type: EstType.Shop,
};

export const Cafe2: Establishment = {
  _id: 4,
  name: 'Cafe',
  description: 'Take 2 coins from the player who just rolled.',
  cost: 1,
  earn: 2,
  rolls: [3],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const FlowerGarden2: Establishment = {
  _id: 5,
  name: 'Flower Garden',
  description: 'Receive 2 coins from the bank.',
  cost: 2,
  earn: 2,
  rolls: [4],
  color: EstColor.Blue,
  type: null,
};

export const ConvenienceStore2: Establishment = {
  _id: 6,
  name: 'Convenience Store',
  description: 'Receive 3 coins from the bank.',
  cost: 1,
  earn: 3,
  rolls: [4],
  color: EstColor.Green,
  type: EstType.Shop,
};

export const Forest2: Establishment = {
  _id: 7,
  name: 'Forest',
  description: 'Receive 2 coins from the bank.',
  cost: 3,
  earn: 2,
  rolls: [5],
  color: EstColor.Blue,
  type: EstType.Gear,
};

export const FlowerShop2: Establishment = {
  _id: 8,
  name: 'Flower Shop',
  description: 'Receive 3 coins from the bank for each "Flower Garden" establishment you own.',
  cost: 1,
  earn: 3, // coins earned per `FlowerGarden2` establishment
  rolls: [6],
  color: EstColor.Green,
  type: null,
};

export const Office2: Establishment = {
  _id: 9,
  name: 'Business Center',
  description: 'You may exchange an establishment with an opponent.',
  cost: 3,
  earn: 0,
  rolls: [6],
  color: EstColor.Purple,
  type: null,
};

export const CornField2: Establishment = {
  _id: 10,
  name: 'Corn Field',
  description: 'Receive 3 coins from the bank.',
  cost: 2,
  earn: 3,
  rolls: [7],
  color: EstColor.Blue,
  type: EstType.Wheat,
};

export const Stadium2: Establishment = {
  _id: 11,
  name: 'Stadium',
  description: 'Take 3 coins from each opponent.',
  cost: 3,
  earn: 3,
  rolls: [7],
  color: EstColor.Purple,
  type: null,
};

export const HamburgerStand2: Establishment = {
  _id: 12,
  name: 'Hamburger Stand',
  description: 'Take 2 coins from the player who just rolled.',
  cost: 1,
  earn: 2,
  rolls: [8],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const FurnitureFactory2: Establishment = {
  _id: 13,
  name: 'Furniture Factory',
  description: 'Receive 4 coins from the bank for each ' + EstType.Gear + ' establishment you own.',
  cost: 4,
  earn: 4, // coins earned per Gear establishment
  rolls: [8],
  color: EstColor.Green,
  type: null,
};

export const TaxOffice2: Establishment = {
  _id: 14,
  name: 'Shopping District',
  description: 'From each opponent who has more than 10 coins, take half, rounded down.',
  cost: 3,
  earn: 10, // This is not the coins taken, but the threshold for triggering the tax office
  rolls: [8, 9],
  color: EstColor.Purple,
  type: null,
};

export const FamilyRestaurant2: Establishment = {
  _id: 15,
  name: 'Family Restaurant',
  description: 'Take 2 coins from the player who just rolled.',
  cost: 2,
  earn: 2,
  rolls: [9, 10],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const Winery2: Establishment = {
  _id: 16,
  name: 'Winery',
  description: 'Receive 3 coins from the bank for each ' + EstType.Fruit + ' establishment you own.',
  cost: 3,
  earn: 3, // coins earned per Fruit establishment
  rolls: [9],
  color: EstColor.Green,
  type: null,
};

export const AppleOrchard2: Establishment = {
  _id: 17,
  name: 'Apple Orchard',
  description: 'Receive 3 coins from the bank.',
  cost: 1,
  earn: 3,
  rolls: [10],
  color: EstColor.Blue,
  type: EstType.Fruit,
};

export const FoodWarehouse2: Establishment = {
  _id: 18,
  name: 'Food Warehouse',
  description: 'Receive 2 coins from the bank for each ' + EstType.Cup + ' establishment you own.',
  cost: 2,
  earn: 2, // coins earned per Cup establishment
  rolls: [10, 11],
  color: EstColor.Green,
  type: null,
};

export const Mine2: Establishment = {
  _id: 19,
  name: 'Mine',
  description: 'Receive 5 coins from the bank.',
  cost: 4,
  earn: 6,
  rolls: [11, 12],
  color: EstColor.Blue,
  type: EstType.Gear,
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
