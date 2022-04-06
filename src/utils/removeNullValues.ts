const emptyArray: unknown[] = [];

export function removeNullValues<T>(values: ReadonlyArray<T | null> | null | undefined): T[] {
  if (!values) {
    return emptyArray as T[];
  }

  const nonNullValues: T[] = [];
  for (const value of values) {
    // loose equality check filters out both `null` and `undefined`, while keeping in '', 0, and false
    if (value != null) {
      nonNullValues.push(value);
    }
  }

  return nonNullValues;
}
