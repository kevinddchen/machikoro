/**
 * Function to assert type is not null to avoid using the non-null assertion operator "!".
 */
export function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (value == null || value === undefined) {
    throw new Error(`Fatal error: value ${String(value)} must not be null/undefined.`);
  }
}
