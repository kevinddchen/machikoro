/**
 * The port we will serve from
 */
export const PORT = parseInt(process.env.PORT ?? '80');

/**
 * true if we are in production
 */
export const IN_PROD = process.env.NODE_ENV === 'production';

/**
 * Maximum player name length, in number of characters.
 */
export const MAX_PLAYER_NAME_LENGTH = 16;
