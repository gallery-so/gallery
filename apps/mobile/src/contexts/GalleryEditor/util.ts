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
