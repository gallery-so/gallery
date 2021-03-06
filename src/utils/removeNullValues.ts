const emptyArray: unknown[] = [];

export function removeNullValues<T>(
  values: ReadonlyArray<T | null | undefined> | null | undefined
): T[] {
  if (!values) {
    return emptyArray as T[];
  }

  const nonNullValues: T[] = [];
  for (const value of values) {
    if (value !== null && value !== undefined) {
      nonNullValues.push(value);
    }
  }

  return nonNullValues;
}
