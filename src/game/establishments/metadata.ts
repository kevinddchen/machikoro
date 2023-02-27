//
// Game metadata for establishments.
//

import { EstColor, EstType, Establishment } from './types';

export const SushiBar: Establishment = {
  _id: 0,
  _expId: 0,
  name: 'Sushi Bar',
  description: 'If you have a "Harbor", take 3 coins from the player who just rolled.',
  cost: 2,
  earn: 3, // only if player has Harbor
  rolls: [1],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 6,
};

export const WheatField: Establishment = {
  _id: 1,
  _expId: 0,
  name: 'Wheat Field',
  description: 'Receive 1 coin from the bank.',
  cost: 1,
  earn: 1,
  rolls: [1],
  color: EstColor.Blue,
  type: EstType.Wheat,
  _initial: 6,
};

export const Ranch: Establishment = {
  _id: 2,
  _expId: 0,
  name: 'Ranch',
  description: 'Receive 1 coin from the bank.',
  cost: 1,
  earn: 1,
  rolls: [2],
  color: EstColor.Blue,
  type: EstType.Animal,
  _initial: 6,
};

export const Bakery: Establishment = {
  _id: 3,
  _expId: 0,
  name: 'Bakery',
  description: 'Receive 1 coin from the bank.',
  cost: 1,
  earn: 1,
  rolls: [2, 3],
  color: EstColor.Green,
  type: EstType.Shop,
  _initial: 6,
};

export const Cafe: Establishment = {
  _id: 4,
  _expId: 0,
  name: 'Cafe',
  description: 'Take 1 coin from the player who just rolled.',
  cost: 2,
  earn: 1,
  rolls: [3],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 6,
};

export const FlowerGarden: Establishment = {
  _id: 5,
  _expId: 0,
  name: 'Flower Garden',
  description: 'Receive 1 coin from the bank.',
  cost: 2,
  earn: 1,
  rolls: [4],
  color: EstColor.Blue,
  type: EstType.Wheat,
  _initial: 6,
};

export const ConvenienceStore: Establishment = {
  _id: 6,
  _expId: 0,
  name: 'Convenience Store',
  description: 'Receive 3 coins from the bank.',
  cost: 2,
  earn: 3,
  rolls: [4],
  color: EstColor.Green,
  type: EstType.Shop,
  _initial: 6,
};

export const Forest: Establishment = {
  _id: 7,
  _expId: 0,
  name: 'Forest',
  description: 'Receive 1 coin from the bank.',
  cost: 3,
  earn: 1,
  rolls: [5],
  color: EstColor.Blue,
  type: EstType.Gear,
  _initial: 6,
};

export const FlowerShop: Establishment = {
  _id: 8,
  _expId: 0,
  name: 'Flower Shop',
  description: 'Receive 1 coin from the bank for each "Flower Garden" establishment you own.',
  cost: 1,
  earn: 1, // coins earned per `FlowerGarden` establishment
  rolls: [6],
  color: EstColor.Green,
  type: EstType.Shop,
  _initial: 6,
};

export const PizzaJoint: Establishment = {
  _id: 9,
  _expId: 0,
  name: 'Pizza Joint',
  description: 'Take 1 coin from the player who just rolled.',
  cost: 1,
  earn: 1,
  rolls: [7],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 6,
};

export const CheeseFactory: Establishment = {
  _id: 10,
  _expId: 0,
  name: 'Cheese Factory',
  description: 'Receive 3 coins from the bank for each ' + EstType.Animal + ' establishment you own.',
  cost: 5,
  earn: 3, // coins earned per Animal establishment
  rolls: [7],
  color: EstColor.Green,
  type: null,
  _initial: 6,
};

export const HamburgerStand: Establishment = {
  _id: 11,
  _expId: 0,
  name: 'Hamburger Stand',
  description: 'Take 1 coin from the player who just rolled.',
  cost: 1,
  earn: 1,
  rolls: [8],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 6,
};

export const MackerelBoat: Establishment = {
  _id: 12,
  _expId: 0,
  name: 'Mackerel Boat',
  description: 'If you have a "Harbor", receive 3 coins from the bank.',
  cost: 2,
  earn: 3, // only if player has Harbor
  rolls: [8],
  color: EstColor.Blue,
  type: null,
  _initial: 6,
};

export const FurnitureFactory: Establishment = {
  _id: 13,
  _expId: 0,
  name: 'Furniture Factory',
  description: 'Receive 3 coins from the bank for each ' + EstType.Gear + ' establishment you own.',
  cost: 3,
  earn: 3, // coins earned per Gear establishment
  rolls: [8],
  color: EstColor.Green,
  type: null,
  _initial: 6,
};

export const Mine: Establishment = {
  _id: 14,
  _expId: 0,
  name: 'Mine',
  description: 'Receive 5 coins from the bank.',
  cost: 6,
  earn: 5,
  rolls: [9],
  color: EstColor.Blue,
  type: EstType.Gear,
  _initial: 6,
};

export const FamilyRestaurant: Establishment = {
  _id: 15,
  _expId: 0,
  name: 'Family Restaurant',
  description: 'Take 2 coins from the player who just rolled.',
  cost: 3,
  earn: 2,
  rolls: [9, 10],
  color: EstColor.Red,
  type: EstType.Cup,
  _initial: 6,
};

export const AppleOrchard: Establishment = {
  _id: 16,
  _expId: 0,
  name: 'Apple Orchard',
  description: 'Receive 3 coins from the bank.',
  cost: 3,
  earn: 3,
  rolls: [10],
  color: EstColor.Blue,
  type: EstType.Wheat,
  _initial: 6,
};

export const FarmersMarket: Establishment = {
  _id: 17,
  _expId: 0,
  name: 'Farmers Market',
  description: 'Receive 2 coins from the bank for each ' + EstType.Wheat + ' establishment you own.',
  cost: 2,
  earn: 2, // coins earned per Wheat establishment
  rolls: [11, 12],
  color: EstColor.Green,
  type: null,
  _initial: 6,
};

export const FoodWarehouse: Establishment = {
  _id: 18,
  _expId: 0,
  name: 'Food Warehouse',
  description: 'Receive 2 coins from the bank for each ' + EstType.Cup + ' establishment you own.',
  cost: 2,
  earn: 2, // coins earned per Cup establishment
  rolls: [12, 13],
  color: EstColor.Green,
  type: null,
  _initial: 6,
};

export const TunaBoat: Establishment = {
  _id: 19,
  _expId: 0,
  name: 'Tuna Boat',
  description: 'Roll 2 dice. If you have a "Harbor", receive as many coins as the dice total from the bank.',
  cost: 5,
  earn: 0, // (special case; determined by tuna boat roll)
  rolls: [12, 13, 14],
  color: EstColor.Blue,
  type: null,
  _initial: 6,
};

export const Stadium: Establishment = {
  _id: 20,
  _expId: 0,
  name: 'Stadium',
  description: 'Take 2 coins from each opponent.',
  cost: 6,
  earn: 2,
  rolls: [6],
  color: EstColor.Purple,
  type: null,
  _initial: null,
};

export const TVStation: Establishment = {
  _id: 21,
  _expId: 0,
  name: 'TV Station',
  description: 'Take 5 coins from an opponent of your choice.',
  cost: 7,
  earn: 5,
  rolls: [6],
  color: EstColor.Purple,
  type: null,
  _initial: null,
};

export const Office: Establishment = {
  _id: 22,
  _expId: 0,
  name: 'Business Center',
  description: 'Exchange a non-Major establishment with an opponent.',
  cost: 8,
  earn: 0,
  rolls: [6],
  color: EstColor.Purple,
  type: null,
  _initial: null,
};

export const Publisher: Establishment = {
  _id: 23,
  _expId: 0,
  name: 'Publisher',
  description:
    'Take 1 coin from each opponent for each ' + EstType.Cup + ' and ' + EstType.Shop + ' establishment they own.',
  cost: 5,
  earn: 1, // coins earned per Cup and Shop establishment
  rolls: [7],
  color: EstColor.Purple,
  type: null,
  _initial: null,
};

export const TaxOffice: Establishment = {
  _id: 24,
  _expId: 0,
  name: 'Tax Office',
  description: 'From each opponent who has more than 10 coins, take half, rounded down.',
  cost: 4,
  earn: 10, // This is not the coins taken, but the threshold for triggering the tax office
  rolls: [8, 9],
  color: EstColor.Purple,
  type: null,
  _initial: null,
};

/**
 * List of all establishments, and order they should be displayed.
 */
export const _ESTABLISHMENTS = [
  SushiBar,
  WheatField,
  Ranch,
  Bakery,
  Cafe,
  FlowerGarden,
  ConvenienceStore,
  Forest,
  FlowerShop,
  PizzaJoint,
  CheeseFactory,
  HamburgerStand,
  MackerelBoat,
  FurnitureFactory,
  Mine,
  FamilyRestaurant,
  AppleOrchard,
  FarmersMarket,
  FoodWarehouse,
  TunaBoat,
  Stadium,
  TVStation,
  Office,
  Publisher,
  TaxOffice,
];

/**
 * Establishments used in the Base expansion.
 */
export const _BASE_ESTABLISHMENTS = [
  WheatField._id,
  Ranch._id,
  Bakery._id,
  Cafe._id,
  ConvenienceStore._id,
  Forest._id,
  CheeseFactory._id,
  FurnitureFactory._id,
  Mine._id,
  FamilyRestaurant._id,
  AppleOrchard._id,
  FarmersMarket._id,
  Stadium._id,
  TVStation._id,
  Office._id,
];

/**
 * Establishments used in the Harbor expansion.
 */
export const _HARBOR_ESTABLISHMENTS = _ESTABLISHMENTS.map((est) => est._id);

/**
 * Establishments a player starts with.
 */
export const _STARTING_ESTABLISHMENTS = [WheatField._id, Bakery._id];

/**
 * Maximum number of unique establishments in the supply for Variable Supply.
 */
export const _VARIABLE_SUPPLY_LIMIT = 10;

/**
 * Maximum number of unique establishments that activate with rolls <= 6 in the
 * supply for Hybrid Supply.
 */
export const _HYBRID_SUPPY_LIMIT_LOWER = 5;

/**
 * Maximum number of unique establishments that activate with rolls > 6 in the
 * supply for Hybrid Supply.
 */
export const _HYBRID_SUPPY_LIMIT_UPPER = 5;

/**
 * Maximum number of unique major (purple) establishments in the supply for
 * Hybrid Supply.
 */
export const _HYBRID_SUPPY_LIMIT_MAJOR = 2;
