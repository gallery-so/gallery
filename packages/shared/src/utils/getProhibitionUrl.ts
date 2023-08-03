import { hexHandler } from './getOpenseaExternalUrl';

const PROHIBITION_CONTRACT_ADDRESSES = new Set(['0x47a91457a3a1f700097199fd63c039c4784384ab']);

export default function getProhibitionUrl(contractAddress: string, tokenId: string) {
  if (PROHIBITION_CONTRACT_ADDRESSES.has(contractAddress)) {
    return `https://prohibition.art/token/${contractAddress}-${hexHandler(tokenId)}`;
  }
  return '';
}
