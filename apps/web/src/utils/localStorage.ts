export function getLocalStorageItem(key: string) {
  const item = window.localStorage.getItem(key);
  const parsedItem = item && (JSON.parse(item) as string);
  return parsedItem ?? '';
}
