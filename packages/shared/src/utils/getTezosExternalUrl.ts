import { hexToDec } from './hexToDec';

// https://www.fxhash.xyz/doc/fxhash/integration-guide
const GENTK_V1_CONTRACT_ADDRESS = 'KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE';
const GENTK_V2_CONTRACT_ADDRESS = 'KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi';
const fxHashContractAddresses = new Set([GENTK_V1_CONTRACT_ADDRESS, GENTK_V2_CONTRACT_ADDRESS]);

/**
 * WARNING: you will rarely want to use this function directly;
 * prefer to use `extractRelevantMetadataFromToken.ts`
 */
export const getFxHashExternalUrlDangerously = (contractAddress: string, tokenId: string) => {
  if (fxHashContractAddresses.has(contractAddress)) {
    return `https://www.fxhash.xyz/gentk/${hexToDec(tokenId)}`;
  }
  return '';
};

/**
 * WARNING: you will rarely want to use this function directly;
 * prefer to use `extractRelevantMetadataFromToken.ts`
 */
export const getObjktExternalUrlDangerously = (contractAddress: string, tokenId: string) => {
  return `https://objkt.com/asset/${contractAddress}/${hexToDec(tokenId)}`;
};
