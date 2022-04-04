/**
 * Various metadata
 */

export const est_names = [
  "Wheat Field",          // 0
  "Livestock Farm",       // 1
  "Bakery",               // 2
  "Cafe",                 // 3
  "Convenience Store",    // 4
  "Forest",               // 5
  "Stadium",              // 6
  "TV Station",           // 7
  "Office",               // 8
  "Cheese Factory",       // 9
  "Furniture Factory",    // 10
  "Mine",                 // 11
  "Restaurant",           // 12 
  "Apple Orchard",        // 13
  "Produce Market",       // 14
  "Sushi Bar",            // 15
  "Flower Orchard",       // 16
  "Flower Shop",          // 17
  "Pizza Joint",          // 18
  "Publisher",            // 19
  "Mackerel Boat",        // 20
  "Hamburger Stand",      // 21
  "Tax Office",           // 22
  "Tuna Boat",            // 23
  "Food Warehouse",       // 24
];

export const est_order = [
  // Blue
  {est:  0, img_path:  "est0.gif", mini_path:  "est0_mini.png"}, // wheat field
  {est:  1, img_path:  "est1.gif", mini_path:  "est1_mini.png"}, // livestock farm
  {est: 16, img_path: "est16.png", mini_path: "est16_mini.png"}, // flower orchard
  {est:  5, img_path:  "est5.gif", mini_path:  "est5_mini.png"}, // forest 
  {est: 20, img_path: "est20.png", mini_path: "est20_mini.png"}, // mackerel boat
  {est: 11, img_path: "est11.gif", mini_path: "est11_mini.png"}, // mine
  {est: 13, img_path: "est13.gif", mini_path: "est13_mini.png"}, // apple orchard
  {est: 23, img_path: "est23.png", mini_path: "est23_mini.png"}, // tuna boat
  // Green
  {est:  2, img_path:  "est2.gif", mini_path:  "est2_mini.png"}, // bakery
  {est:  4, img_path:  "est4.gif", mini_path:  "est4_mini.png"}, // convenience store
  {est: 17, img_path: "est17.png", mini_path: "est17_mini.png"}, // flower shop
  {est:  9, img_path:  "est9.gif", mini_path:  "est9_mini.png"}, // cheese factory
  {est: 10, img_path: "est10.gif", mini_path: "est10_mini.png"}, // furniture factory
  {est: 14, img_path: "est14.gif", mini_path: "est14_mini.png"}, // produce market
  {est: 24, img_path: "est24.png", mini_path: "est24_mini.png"}, // food warehouse
  // Red
  {est: 15, img_path: "est15.png", mini_path: "est15_mini.png"}, // sushi bar
  {est:  3, img_path:  "est3.gif", mini_path:  "est3_mini.png"}, // cafe
  {est: 18, img_path: "est18.png", mini_path: "est18_mini.png"}, // pizza joint 
  {est: 21, img_path: "est21.png", mini_path: "est21_mini.png"}, // hamburger stand
  {est: 12, img_path: "est12.gif", mini_path: "est12_mini.png"}, // restaurant
  // Purple
  {est:  6, img_path:  "est6.gif", mini_path:  "est6_mini.png"}, // stadium
  {est:  7, img_path:  "est7.gif", mini_path:  "est7_mini.png"}, // TV station
  {est:  8, img_path:  "est8.gif", mini_path:  "est8_mini.png"}, // office
  {est: 19, img_path: "est19.png", mini_path: "est19_mini.png"}, // publisher 
  {est: 22, img_path: "est22.png", mini_path: "est22_mini.png"}, // tax office 
];

// for hybrid supply
export const deck1 = [0, 1, 16, 5, 2, 4, 17, 15, 3];
export const deck2 = [20, 11, 13, 23, 9, 10, 14, 24, 18, 21, 12];
export const deck3 = [6, 7, 8, 19, 22];

export const land_names = [
  "Train Station",    // 0
  "Shopping Mall",    // 1
  "Amusement Park",   // 2
  "Radio Tower",      // 3
  "City Hall",        // 4
  "Harbor",           // 5
  "Airport",          // 6
];

export const land_order = [
  //{land: 4, img_path: "land4.png"},
  {land: 5, img_path: "land5.png"},
  {land: 0, img_path: "land0.gif"},
  {land: 1, img_path: "land1.gif"},
  {land: 2, img_path: "land2.gif"},
  {land: 3, img_path: "land3.gif"},
  {land: 6, img_path: "land6.png"},
];
