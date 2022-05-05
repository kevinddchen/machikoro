import { Landmark } from '../types';

export const TrainStation: Landmark = {
  _id: 0,
  name: "Train Station",
  description: "",
  cost: 4,
  image_filename: "land0.gif", 
};

export const ShoppingMall: Landmark = {
  _id: 1,
  name: "Shopping Mall",
  description: "",
  cost: 10,
  image_filename: "land1.gif", 
};

export const AmusementPark: Landmark = {
  _id: 2,
  name: "Amusement Park",
  description: "",
  cost: 16,
  image_filename: "land2.gif", 
};

export const RadioTower: Landmark = {
  _id: 3,
  name: "Radio Tower",
  description: "",
  cost: 22,
  image_filename: "land3.gif", 
};

export const Harbor: Landmark = {
  _id: 4,
  name: "Harbor",
  description: "",
  cost: 2,
  image_filename: "land5.png", 
};

export const Airport: Landmark = {
  _id: 5,
  name: "Airport",
  description: "",
  cost: 30,
  image_filename: "land6.png", 
};

export const all_landmarks: Landmark[] = [
  TrainStation,
  ShoppingMall,
  AmusementPark,
  RadioTower,
  Harbor,
  Airport,
];

export const _base_landmark_ids: number[] = [0, 1, 2, 3];

export const _harbor_landmark_ids: number[] = [0, 1, 2, 3, 4, 5];
