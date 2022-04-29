// The port we will serve from
export const PORT = process.env.PORT? parseInt(process.env.PORT) : 80;

// True if we are in production
export const IN_PROD = process.env.NODE_ENV === 'production';

// Lobby fetch request timer, in milliseconds
export const UPDATE_INTERVAL = 1000;
