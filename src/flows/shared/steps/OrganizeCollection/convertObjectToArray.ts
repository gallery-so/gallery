import { EditModeNft } from './types';

// converts an object into an array containing all of the object's values
export function convertObjectToArray(object: Record<string, EditModeNft>) {
  return Object.keys(object).map((key) => object[key]);
}
