const GALLERY_OS_ADDRESS = '0x8914496dc01efcc49a2fa340331fb90969b6f1d2';

// The backend converts all token IDs to hexadecimals; here, we convert back
// https://stackoverflow.com/a/53751162
export const hexHandler = (str: string) => {
  if (str.length % 2) {
    str = '0' + str;
  }

  const bn = BigInt('0x' + str);
  const d = bn.toString(10);
  return d;
};

export const getOpenseaExternalUrl = (contractAddress: string, tokenId: string) => {
  const hexTokenId = hexHandler(tokenId);

  // Allows us to get referral credit
  const ref = GALLERY_OS_ADDRESS;

  return `https://opensea.io/assets/${contractAddress}/${hexTokenId}?ref=${ref}`;
};
