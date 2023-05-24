/**
 * Function to assert type is not null to avoid using the non-null assertion operator "!".
 */
export function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value == null || value === undefined) {
    throw new Error(`Fatal error: value ${String(value)} must not be null/undefined.`);
  }
}

/**
 * Function that should never be called with any argument and throws an error if it is called.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertUnreachable = (_: never): never => {
  throw new Error('Unreachable code');
};
