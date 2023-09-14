import { hexToDec } from './hexToDec';

const PROHIBITION_CONTRACT_ADDRESSES = new Set(['0x47a91457a3a1f700097199fd63c039c4784384ab']);

/**
 * WARNING: you will rarely want to use this function directly;
 * prefer to use `extractRelevantMetadataFromToken.ts`
 */
export function getProhibitionUrlDangerously(contractAddress: string, tokenId: string) {
  if (PROHIBITION_CONTRACT_ADDRESSES.has(contractAddress)) {
    return `https://prohibition.art/token/${contractAddress}-${hexToDec(tokenId)}`;
  }
  return '';
}
