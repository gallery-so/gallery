export default function arrayToObjectKeyedById<T extends Record<string, any>>(
  idKey: keyof T,
  list: readonly T[]
): { [idKey: string]: T } {
  const keyedById: { [idKey: string]: T } = {};

  for (const item of list) {
    keyedById[item[idKey]] = item;
  }

  return keyedById;
}
