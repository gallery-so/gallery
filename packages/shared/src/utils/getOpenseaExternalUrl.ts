import { hexToDec } from './hexToDec';

export const GALLERY_OS_ADDRESS = '0x8914496dc01efcc49a2fa340331fb90969b6f1d2';

/**
 * WARNING: you will rarely want to use this function directly;
 * prefer to use `extractRelevantMetadataFromToken.ts`
 */
export const getOpenseaExternalUrlDangerously = (
  chainStr: string,
  contractAddress: string,
  tokenId: string
) => {
  let chain = chainStr.toLocaleLowerCase();
  if (chain === 'polygon') chain = 'matic';
  const hexTokenId = hexToDec(tokenId);

  return `https://opensea.io/assets/${chain}/${contractAddress}/${hexTokenId}?ref=${GALLERY_OS_ADDRESS}`;
};

export const getOpenseaExternalUrlDangerouslyForCollection = (
  chainStr: string,
  contractAddress: string
) => {
  let chain = chainStr.toLocaleLowerCase();
  if (chain === 'polygon') chain = 'matic';

  return `https://opensea.io/assets/${chain}/${contractAddress}`;
};
