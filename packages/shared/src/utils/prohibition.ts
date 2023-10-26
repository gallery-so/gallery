import { hexToDec } from './hexToDec';

const PROHIBITION_CONTRACT_ADDRESSES = new Set(['0x47a91457a3a1f700097199fd63c039c4784384ab']);

// Projects that are known to crash browsers
const LIVE_RENDER_DISABLED_PROJECT_IDS = new Set([32, 91, 210]);

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

export function getProhibitionUrlDangerouslyForCollection(contractAddress: string, collectionName: string) {
  if (PROHIBITION_CONTRACT_ADDRESSES.has(contractAddress)) {
    return `https://prohibition.art/${collectionName}`;
  }
  return '';
}

function getProhibitionProjectId(tokenId: string) {
  // same formula as art blocks
  return Math.floor(Number(tokenId) / 1000000);
}

export function isKnownComputeIntensiveToken(contractAddress: string, tokenId: string) {
  if (PROHIBITION_CONTRACT_ADDRESSES.has(contractAddress)) {
    const projectId = getProhibitionProjectId(hexToDec(tokenId));
    if (LIVE_RENDER_DISABLED_PROJECT_IDS.has(projectId)) {
      return true;
    }
  }
  return false;
}
