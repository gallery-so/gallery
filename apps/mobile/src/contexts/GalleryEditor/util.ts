export function generate12DigitId() {
  return Math.round(Math.random() * 1000000000000).toString();
}

export const DEFAULT_COLUMNS = 3;
export const MIN_COLUMNS = 1;
export const SOFT_CAP_MAX_COLUMNS = 6;
export const HARD_CAP_MAX_COLUMNS = 10;

export function isValidColumns(columns: number) {
  return columns >= MIN_COLUMNS && columns <= HARD_CAP_MAX_COLUMNS;
}

// https://github.com/clauderic/dnd-kit/blob/694dcc2f62e5269541fc941fa6c9af46ccd682ad/packages/sortable/src/utilities/arrayMove.ts
/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const element = newArray.splice(from, 1)[0];

  if (element === undefined) {
    throw new Error(`No element found at index ${from}`);
  }

  newArray.splice(to < 0 ? newArray.length + to : to, 0, element);
  return newArray;
}
