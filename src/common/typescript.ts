// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertUnreachable = (_: never): never => {
  throw new Error('Unreachable code');
};
