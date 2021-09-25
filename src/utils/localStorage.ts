export function getLocalStorageItem<T>(key: string) {
  const persistedValue = window.localStorage.getItem(key);

  // Return null if requested value not found
  if (persistedValue === null) {
    return persistedValue;
  }

  // Support json string or string
  try {
    return JSON.parse(persistedValue) as T;
  } catch {
    // Technically shouldn't be reachable.. but for safety
    return null;
  }
}
