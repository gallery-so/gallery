type Obj = Record<string, unknown>;

export function removeNullishValues(obj: Obj) {
  return Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined)
    .reduce((newObj: Obj, key) => {
      newObj[key] = obj[key];
      return newObj;
    }, {});
}
