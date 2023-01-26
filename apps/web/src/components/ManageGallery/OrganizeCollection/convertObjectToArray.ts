import { EditModeToken } from './types';

// converts an object into an array containing all of the object's values
export function convertObjectToArray(object: Record<string, EditModeToken>) {
  return Object.keys(object).map((key) => object[key]);
}
