export function removeNullValues<T>(values: ReadonlyArray<T | null>): T[] {
  const nonNullValues: T[] = [];
  for (const value of values) {
    if (value) {
      nonNullValues.push(value);
    }
  }

  return nonNullValues;
}
