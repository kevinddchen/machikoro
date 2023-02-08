//
// Game metadata for establishments.
//

import { EstColor, EstType } from './types';

import type { Establishment } from './types';

export const WheatField: Establishment = {
  _id: 0,
  name: 'Wheat Field',
  description: '',
  imageFilename: 'est0.gif',
  miniFilename: 'est0_mini.png',
  cost: 1,
  earnings: 1,
  rolls: [1],
  color: EstColor.Blue,
  type: EstType.Wheat,
};

export const LivestockFarm: Establishment = {
  _id: 1,
  name: 'Livestock Farm',
  description: '',
  imageFilename: 'est1.gif',
  miniFilename: 'est1_mini.png',
  cost: 1,
  earnings: 1,
  rolls: [2],
  color: EstColor.Blue,
  type: EstType.Animal,
};

export const Bakery: Establishment = {
  _id: 2,
  name: 'Bakery',
  description: '',
  imageFilename: 'est2.gif',
  miniFilename: 'est2_mini.png',
  cost: 1,
  earnings: 1,
  rolls: [2, 3],
  color: EstColor.Green,
  type: EstType.Shop,
};

export const Cafe: Establishment = {
  _id: 3,
  name: 'Cafe',
  description: '',
  imageFilename: 'est3.gif',
  miniFilename: 'est3_mini.png',
  cost: 2,
  earnings: 1,
  rolls: [3],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const ConvenienceStore: Establishment = {
  _id: 4,
  name: 'Convenience Store',
  description: '',
  imageFilename: 'est4.gif',
  miniFilename: 'est4_mini.png',
  cost: 2,
  earnings: 3,
  rolls: [4],
  color: EstColor.Green,
  type: EstType.Shop,
};

export const Forest: Establishment = {
  _id: 5,
  name: 'Forest',
  description: '',
  imageFilename: 'est5.gif',
  miniFilename: 'est5_mini.png',
  cost: 3,
  earnings: 1,
  rolls: [5],
  color: EstColor.Blue,
  type: EstType.Gear,
};

export const Stadium: Establishment = {
  _id: 6,
  name: 'Stadium',
  description: '',
  imageFilename: 'est6.gif',
  miniFilename: 'est6_mini.png',
  cost: 6,
  earnings: 2,
  rolls: [6],
  color: EstColor.Purple,
  type: null,
};

export const TVStation: Establishment = {
  _id: 7,
  name: 'TV Station',
  description: '',
  imageFilename: 'est7.gif',
  miniFilename: 'est7_mini.png',
  cost: 7,
  earnings: 5,
  rolls: [6],
  color: EstColor.Purple,
  type: null,
};

export const Office: Establishment = {
  _id: 8,
  name: 'Office',
  description: '',
  imageFilename: 'est8.gif',
  miniFilename: 'est8_mini.png',
  cost: 8,
  earnings: 0,
  rolls: [6],
  color: EstColor.Purple,
  type: null,
};

export const CheeseFactory: Establishment = {
  _id: 9,
  name: 'Cheese Factory',
  description: '',
  imageFilename: 'est9.gif',
  miniFilename: 'est9_mini.png',
  cost: 5,
  earnings: 3, // coins earned per Animal establishment
  rolls: [7],
  color: EstColor.Green,
  type: null,
};

export const FurnitureFactory: Establishment = {
  _id: 10,
  name: 'Furniture Factory',
  description: '',
  imageFilename: 'est10.gif',
  miniFilename: 'est10_mini.png',
  cost: 3,
  earnings: 3, // coins earned per Gear establishment
  rolls: [8],
  color: EstColor.Green,
  type: null,
};

export const Mine: Establishment = {
  _id: 11,
  name: 'Mine',
  description: '',
  imageFilename: 'est11.gif',
  miniFilename: 'est11_mini.png',
  cost: 6,
  earnings: 5,
  rolls: [9],
  color: EstColor.Blue,
  type: EstType.Gear,
};

export const Restaurant: Establishment = {
  _id: 12,
  name: 'Restaurant',
  description: '',
  imageFilename: 'est12.gif',
  miniFilename: 'est12_mini.png',
  cost: 3,
  earnings: 2,
  rolls: [9, 10],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const AppleOrchard: Establishment = {
  _id: 13,
  name: 'Apple Orchard',
  description: '',
  imageFilename: 'est13.gif',
  miniFilename: 'est13_mini.png',
  cost: 3,
  earnings: 3,
  rolls: [10],
  color: EstColor.Blue,
  type: EstType.Wheat,
};

export const ProduceMarket: Establishment = {
  _id: 14,
  name: 'Produce Market',
  description: '',
  imageFilename: 'est14.gif',
  miniFilename: 'est14_mini.png',
  cost: 2,
  earnings: 2, // coins earned per Wheat establishment
  rolls: [11, 12],
  color: EstColor.Green,
  type: null,
};

export const SushiBar: Establishment = {
  _id: 15,
  name: 'Sushi Bar',
  description: '',
  imageFilename: 'est15.png',
  miniFilename: 'est15_mini.png',
  cost: 2,
  earnings: 3, // only if player has Harbor
  rolls: [1],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const FlowerOrchard: Establishment = {
  _id: 16,
  name: 'Flower Orchard',
  description: '',
  imageFilename: 'est16.png',
  miniFilename: 'est16_mini.png',
  cost: 2,
  earnings: 1,
  rolls: [4],
  color: EstColor.Blue,
  type: EstType.Wheat,
};

export const FlowerShop: Establishment = {
  _id: 17,
  name: 'Flower Shop',
  description: '',
  imageFilename: 'est17.png',
  miniFilename: 'est17_mini.png',
  cost: 1,
  earnings: 1, // coins earned per Flower Orchard establishment
  rolls: [6],
  color: EstColor.Green,
  type: EstType.Shop,
};

export const PizzaJoint: Establishment = {
  _id: 18,
  name: 'Pizza Joint',
  description: '',
  imageFilename: 'est18.png',
  miniFilename: 'est18_mini.png',
  cost: 1,
  earnings: 1,
  rolls: [7],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const Publisher: Establishment = {
  _id: 19,
  name: 'Publisher',
  description: '',
  imageFilename: 'est19.png',
  miniFilename: 'est19_mini.png',
  cost: 5,
  earnings: 1, // coins earned per Cup and Shop establishment
  rolls: [7],
  color: EstColor.Purple,
  type: null,
};

export const MackerelBoat: Establishment = {
  _id: 20,
  name: 'Mackerel Boat',
  description: '',
  imageFilename: 'est20.png',
  miniFilename: 'est20_mini.png',
  cost: 2,
  earnings: 3, // only if player has Harbor
  rolls: [8],
  color: EstColor.Blue,
  type: null,
};

export const HamburgerStand: Establishment = {
  _id: 21,
  name: 'Hamburger Stand',
  description: '',
  imageFilename: 'est21.png',
  miniFilename: 'est21_mini.png',
  cost: 1,
  earnings: 1,
  rolls: [8],
  color: EstColor.Red,
  type: EstType.Cup,
};

export const TaxOffice: Establishment = {
  _id: 22,
  name: 'Tax Office',
  description: '',
  imageFilename: 'est22.png',
  miniFilename: 'est22_mini.png',
  cost: 4,
  earnings: 0, // (special case)
  rolls: [8, 9],
  color: EstColor.Purple,
  type: null,
};

// number of coins tax office triggers on
export const TAX_OFFICE_THRESHOLD = 10;

export const TunaBoat: Establishment = {
  _id: 23,
  name: 'Tuna Boat',
  description: '',
  imageFilename: 'est23.png',
  miniFilename: 'est23_mini.png',
  cost: 5,
  earnings: 0, // (special case)
  rolls: [12, 13, 14],
  color: EstColor.Blue,
  type: null,
};

export const FoodWarehouse: Establishment = {
  _id: 24,
  name: 'Food Warehouse',
  description: '',
  imageFilename: 'est24.png',
  miniFilename: 'est24_mini.png',
  cost: 2,
  earnings: 2, // coins earned per Cup establishment
  rolls: [12, 13],
  color: EstColor.Green,
  type: null,
};

/**
 * List of all establishments, and order they should be displayed.
 */
export const ESTABLISHMENTS: Establishment[] = [
  SushiBar,
  WheatField,
  LivestockFarm,
  Bakery,
  Cafe,
  FlowerOrchard,
  ConvenienceStore,
  Forest,
  FlowerShop,
  PizzaJoint,
  CheeseFactory,
  HamburgerStand,
  MackerelBoat,
  FurnitureFactory,
  Mine,
  Restaurant,
  AppleOrchard,
  ProduceMarket,
  FoodWarehouse,
  TunaBoat,
  Stadium,
  TVStation,
  Office,
  Publisher,
  TaxOffice,
];

/**
 * Maximum number of unique establishments in the supply for Variable Supply.
 */
export const VARIABLE_SUPPLY_LIMIT = 10;

/**
 * Maximum number of unique establishments that activate with rolls <= 6 in the
 * supply for Hybrid Supply.
 */
export const HYBRID_SUPPY_LIMIT_LOWER = 5;

/**
 * Maximum number of unique establishments that activate with rolls > 6 in the
 * supply for Hybrid Supply.
 */
export const HYBRID_SUPPY_LIMIT_UPPER = 5;

/**
 * Maximum number of unique purple establishments in the supply for Hybrid
 * Supply.
 */
export const HYBRID_SUPPY_LIMIT_PURPLE = 2;

/**
 * List of all establishments, sorted by ID.
 */
export const _ESTABLISHMENTS_BY_ID = [...ESTABLISHMENTS].sort((a, b) => a._id - b._id);

/**
 * Establishments used in the Base expansion.
 */
export const _BASE_ESTABLISHMENT_IDS = [...Array(15).keys()]; // 0, 1, ..., 14

/**
 * Establishments used in the Harbor expansion.
 */
export const _HARBOR_ESTABLISHMENT_IDS = [...Array(25).keys()]; // 0, 1, ..., 24

/**
 * Establishments a player starts with.
 */
export const _STARTING_ESTABLISHMENT_IDS = [0, 2];
