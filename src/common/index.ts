// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertUnreachable = (_x: never): never => {
  throw new Error('Unreachable code');
};
