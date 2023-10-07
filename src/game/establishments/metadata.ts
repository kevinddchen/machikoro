//
// Game metadata for establishments.
//

import { EstColor, EstType, Establishment } from './types';
import { Expansion, Version } from '../types';

export const SushiBar: Establishment = {
  _id: 0,
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
  name: 'Café',
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
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
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
  version: Version.MK1,
  expansion: Expansion.Base,
  name: 'Business Center',
  description: 'Exchange a non-Major establishment with an opponent.',
  cost: 8,
  earn: 0, // (special case)
  rolls: [6],
  color: EstColor.Purple,
  type: null,
  _initial: null,
};

export const Publisher: Establishment = {
  _id: 23,
  version: Version.MK1,
  expansion: Expansion.Harbor,
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
  version: Version.MK1,
  expansion: Expansion.Harbor,
  name: 'Tax Office',
  description: 'From each opponent who has 10 or more coins, take half, rounded down.',
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
export const _BASE_ESTABLISHMENTS = _ESTABLISHMENTS
  .filter((est) => est.expansion === Expansion.Base)
  .map((est) => est._id);

/**
 * Establishments added in the Harbor expansion.
 */
export const _HARBOR_ESTABLISHMENTS = _ESTABLISHMENTS
  .filter((est) => est.expansion === Expansion.Harbor)
  .map((est) => est._id);

/**
 * Establishments a player starts with in Machi Koro 1.
 */
export const _STARTING_ESTABLISHMENTS = [WheatField._id, Bakery._id];
