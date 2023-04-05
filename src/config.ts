/**
 * The port we will serve from
 */
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

/**
 * true if we are in production
 */
export const IN_PROD = process.env.NODE_ENV === 'production';
