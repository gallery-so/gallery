// The backend converts all token IDs to hexadecimals; here, we convert back
// https://stackoverflow.com/a/53751162
export const hexToDec = (str: string) => {
  if (str.length % 2) {
    str = '0' + str;
  }

  const bn = BigInt('0x' + str);
  const d = bn.toString(10);
  return d;
};
