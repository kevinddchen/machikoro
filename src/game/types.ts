import { CardType, Color, State, SupplyVariant } from './enums';

export type MachikoroG = {
  state: State, // tracks game state
  roll: number, // player roll
  numRolls: number; // number of rolls made
  money: number[];
  est_data: EstablishmentData; 
  land_data: LandmarkData;
  supplyVariant: SupplyVariant;
  turn_order: string[];
  secret: Secrets; // not passed to clients
  log: LogLine[];
  log_i: number;
  secondTurn: boolean; // true if player can make another turn
  doTV: boolean; // true if player will activate TV
  doOffice: boolean; // true if player will activate office
  officeEst: Establishment | null; // establishment picked for office
  tunaRoll: number | null; // roll made for tuna boat
  justBought: Establishment | null; // establishment just bought (for prettier rendering)
};

export type LogLine = {
  id: number;
  line: string;
};

export type Secrets = {
  decks: Establishment[][];
};

export type Establishment = {
  readonly _id: number; // unique internal id used to enumerate establishments
  readonly name: string; // display name
  readonly description: string; // tooltip text
  readonly image_filename: string; // filename of full-sized image
  readonly mini_filename: string; // filename of miniature image
  readonly cost: number;
  readonly base: number; // the earnings per activation (for simple effects)
  readonly activation: number[]; // which rolls the establishment activates
  readonly color: Color;
  readonly type: CardType | null;
};

export type EstablishmentData = {
  _in_use: boolean[];
  _remaining_count: number[]; // remaining in supply and deck
  _available_count: number[]; // available to buy from supply
  _owned_count: number[][];
};

export type Landmark = {
  readonly _id: number; // internal id used to enumerate landmarks
  readonly name: string;
  readonly description: string;
  readonly image_filename: string;
  readonly cost: number;
};

export type LandmarkData = {
  _in_use: boolean[];
  _owned: boolean[][];
};
