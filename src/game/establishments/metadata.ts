import { Color, CardType } from '../enums';
import { Establishment } from '../types';

export const WheatField: Establishment = {
  _id: 0,
  name: "Wheat Field",
  description: "",
  image_filename: "est0.gif", 
  mini_filename:  "est0_mini.png",
  cost: 1,
  base: 1,
  activation: [1],
  color: Color.Blue,
  type: CardType.Wheat,
};

export const LivestockFarm: Establishment = {
  _id: 1,
  name: "Livestock Farm",
  description: "",
  image_filename: "est1.gif", 
  mini_filename:  "est1_mini.png",
  cost: 1,
  base: 1,
  activation: [2],
  color: Color.Blue,
  type: CardType.Animal,
};

export const Bakery: Establishment = {
  _id: 2,
  name: "Bakery",
  description: "",
  image_filename: "est2.gif", 
  mini_filename:  "est2_mini.png",
  cost: 1,
  base: 1,
  activation: [2, 3],
  color: Color.Green,
  type: CardType.Shop,
};

export const Cafe: Establishment = {
  _id: 3,
  name: "Cafe",
  description: "",
  image_filename: "est3.gif", 
  mini_filename:  "est3_mini.png",
  cost: 2,
  base: 1,
  activation: [3],
  color: Color.Red,
  type: CardType.Cup,
};

export const ConvenienceStore: Establishment = {
  _id: 4,
  name: "Convenience Store",
  description: "",
  image_filename: "est4.gif", 
  mini_filename:  "est4_mini.png",
  cost: 2,
  base: 3,
  activation: [4],
  color: Color.Green,
  type: CardType.Shop,
};

export const Forest: Establishment = {
  _id: 5,
  name: "Forest",
  description: "",
  image_filename: "est5.gif", 
  mini_filename:  "est5_mini.png",
  cost: 3,
  base: 1,
  activation: [5],
  color: Color.Blue,
  type: CardType.Gear,
};

export const Stadium: Establishment = {
  _id: 6,
  name: "Stadium",
  description: "",
  image_filename: "est6.gif", 
  mini_filename:  "est6_mini.png",
  cost: 6,
  base: 2,
  activation: [6],
  color: Color.Purple,
  type: null,
};

export const TVStation: Establishment = {
  _id: 7,
  name: "TV Station",
  description: "",
  image_filename: "est7.gif", 
  mini_filename:  "est7_mini.png",
  cost: 7,
  base: 5,
  activation: [6],
  color: Color.Purple,
  type: null,
};

export const Office: Establishment = {
  _id: 8,
  name: "Office",
  description: "",
  image_filename: "est8.gif", 
  mini_filename:  "est8_mini.png",
  cost: 8,
  base: 0,
  activation: [6],
  color: Color.Purple,
  type: null,
};

export const CheeseFactory: Establishment = {
  _id: 9,
  name: "Cheese Factory",
  description: "",
  image_filename: "est9.gif", 
  mini_filename:  "est9_mini.png",
  cost: 5,
  base: 3, // coins earned per Animal establishment
  activation: [7],
  color: Color.Green,
  type: null,
};

export const FurnitureFactory: Establishment = {
  _id: 10,
  name: "Furniture Factory",
  description: "",
  image_filename: "est10.gif", 
  mini_filename:  "est10_mini.png",
  cost: 3,
  base: 3, // coins earned per Gear establishment
  activation: [8],
  color: Color.Green,
  type: null,
};

export const Mine: Establishment = {
  _id: 11,
  name: "Mine",
  description: "",
  image_filename: "est11.gif", 
  mini_filename:  "est11_mini.png",
  cost: 6,
  base: 5,
  activation: [9],
  color: Color.Blue,
  type: CardType.Gear,
};

export const Restaurant: Establishment = {
  _id: 12,
  name: "Restaurant",
  description: "",
  image_filename: "est12.gif", 
  mini_filename:  "est12_mini.png",
  cost: 3,
  base: 2,
  activation: [9, 10],
  color: Color.Red,
  type: CardType.Cup,
};

export const AppleOrchard: Establishment = {
  _id: 13,
  name: "Apple Orchard",
  description: "",
  image_filename: "est13.gif", 
  mini_filename:  "est13_mini.png",
  cost: 3,
  base: 3,
  activation: [10],
  color: Color.Blue,
  type: CardType.Wheat,
};

export const ProduceMarket: Establishment = {
  _id: 14,
  name: "Produce Market",
  description: "",
  image_filename: "est14.gif", 
  mini_filename:  "est14_mini.png",
  cost: 2,
  base: 2, // coins earned per Wheat establishment
  activation: [11, 12],
  color: Color.Green,
  type: null,
};

export const SushiBar: Establishment = {
  _id: 15,
  name: "Sushi Bar",
  description: "",
  image_filename: "est15.png", 
  mini_filename:  "est15_mini.png",
  cost: 2,
  base: 3, // only if player has Harbor
  activation: [1],
  color: Color.Red,
  type: CardType.Cup,
};

export const FlowerOrchard: Establishment = {
  _id: 16,
  name: "Flower Orchard",
  description: "",
  image_filename: "est16.png", 
  mini_filename:  "est16_mini.png",
  cost: 2,
  base: 1,
  activation: [4],
  color: Color.Blue,
  type: CardType.Wheat,
};

export const FlowerShop: Establishment = {
  _id: 17,
  name: "Flower Shop",
  description: "",
  image_filename: "est17.png", 
  mini_filename:  "est17_mini.png",
  cost: 1,
  base: 1, // coins earned per Flower Orchard establishment
  activation: [6],
  color: Color.Green,
  type: CardType.Shop,
};

export const PizzaJoint: Establishment = {
  _id: 18,
  name: "Pizza Joint",
  description: "",
  image_filename: "est18.png", 
  mini_filename:  "est18_mini.png",
  cost: 1,
  base: 1,
  activation: [7],
  color: Color.Red,
  type: CardType.Cup,
};

export const Publisher: Establishment = {
  _id: 19,
  name: "Publisher",
  description: "",
  image_filename: "est19.png", 
  mini_filename:  "est19_mini.png",
  cost: 5,
  base: 1, // coins earned per Cup and Shop establishment
  activation: [7],
  color: Color.Purple,
  type: null,
};

export const MackerelBoat: Establishment = {
  _id: 20,
  name: "Mackerel Boat",
  description: "",
  image_filename: "est20.png", 
  mini_filename:  "est20_mini.png",
  cost: 2,
  base: 3, // only if player has Harbor
  activation: [8],
  color: Color.Blue,
  type: null,
};

export const HamburgerStand: Establishment = {
  _id: 21,
  name: "Hamburger Stand",
  description: "",
  image_filename: "est21.png", 
  mini_filename:  "est21_mini.png",
  cost: 1,
  base: 1,
  activation: [8],
  color: Color.Red,
  type: CardType.Cup,
};

export const TaxOffice: Establishment = {
  _id: 22,
  name: "Tax Office",
  description: "",
  image_filename: "est22.png", 
  mini_filename:  "est22_mini.png",
  cost: 4,
  base: 0, // (special case)
  activation: [8, 9],
  color: Color.Purple,
  type: null,
};

// number of coins tax office triggers on
export const TAX_OFFICE_THRESHOLD = 10;

export const TunaBoat: Establishment = {
  _id: 23,
  name: "Tuna Boat",
  description: "",
  image_filename: "est23.png", 
  mini_filename:  "est23_mini.png",
  cost: 5,
  base: 0, // (special case)
  activation: [12, 13, 14],
  color: Color.Blue,
  type: null,
};

export const FoodWarehouse: Establishment = {
  _id: 24,
  name: "Food Warehouse",
  description: "",
  image_filename: "est24.png", 
  mini_filename:  "est24_mini.png",
  cost: 2,
  base: 2, // coins earned per Cup establishment
  activation: [12, 13],
  color: Color.Green,
  type: null,
};

// this array also sets the order establishments are displayed
export const all_establishments: Establishment[] = [
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

// ids of establishments used in base game
export const base_establishment_ids = [...Array(15).keys()]; // 0, 1, ..., 14

// ids of establishments used in harbor expansion
export const harbor_establishment_ids = [...Array(25).keys()]; // 0, 1, ..., 24

// ids of establishments that the players start with
export const starting_establishment_ids = [0, 2];
