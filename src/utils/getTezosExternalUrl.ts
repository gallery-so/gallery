// https://www.fxhash.xyz/doc/fxhash/integration-guide
const GENTK_V1_CONTRACT_ADDRESS = 'KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE';
const GENTK_V2_CONTRACT_ADDRESS = 'KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi';
const fxHashContractAddresses = new Set([GENTK_V1_CONTRACT_ADDRESS, GENTK_V2_CONTRACT_ADDRESS]);

export const getFxHashExternalUrl = (contractAddress: string, tokenId: string) => {
  if (fxHashContractAddresses.has(contractAddress)) {
    return `https://www.fxhash.xyz/gentk/${tokenId}`;
  }
  return null;
};

export const getObjktExternalUrl = (contractAddress: string, tokenId: string) => {
  return `https://objkt.com/asset/${contractAddress}/${tokenId}`;
};
