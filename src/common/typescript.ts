export const assertUnreachable = (_: never): never => {
  throw new Error('Unreachable code');
};
