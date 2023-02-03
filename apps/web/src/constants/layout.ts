export const DEFAULT_COLUMNS = 3;
export const MIN_COLUMNS = 1;
export const SOFT_CAP_MAX_COLUMNS = 6;
export const HARD_CAP_MAX_COLUMNS = 10;

export function isValidColumns(columns: number) {
  return columns >= MIN_COLUMNS && columns <= HARD_CAP_MAX_COLUMNS;
}
