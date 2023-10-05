import { hexToDec } from './hexToDec';

// https://www.fxhash.xyz/doc/fxhash/integration-guide
const fxHashContractAddresses = new Set([
  'KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv', // issuer
  'KT1Xpmp15KfqoePNW9HczFmqaGNHwadV2a3b', // issuer_v3
  'KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE', // gentk_v1
  'KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi', // gentk_v2
  'KT1EfsNuqwLAWDd3o4pvfUx1CAh5GMdTrRvr', // gentk_v3
  'KT19etLCjCCzTLFFAxsxLFsVYMRPetr2bTD5', // mint_ticket_v3
  'KT1GtbuswcNMGhHF2TSuH1Yfaqn16do8Qtva', // articles
  'KT1Xo5B7PNBAeynZPmca4bRh6LQow4og1Zb9', // marketplace_v1
  'KT1GbyoDi7H1sfXmimXpptZJuCdHMh66WS9u', // marketplace_v2
  'KT1M1NyU9X4usEimt2f3kDaijZnDMNBu42Ja', // marketplace_v3
  'KT1Ezht4PDKZri7aVppVGT4Jkw39sesaFnww', // user_register
  'KT1FvGQcPxzuJkJsdWFQiGkueSNT5mqpFDrf', // moderation_team
  'KT18tPu7uXy9PJ97i3qCLsr7an4X6sQ5qxU7', // moderation_token
  'KT1Wn2kkKmdbyLWBiLXWCkE7fKj1LsLKar2A', // moderation_user
  'KT1BgD9SPfysnMz3vkfm6ZEaGFKCVcE5ay91', // cycles
  'KT1JrUPSCt1r2MB2J7Lk2KwiWSYr3Mr414ck', // collab_factory
]);

export function isFxHashContractAddress(address?: string | null) {
  if (address) {
    return fxHashContractAddresses.has(address);
  }
  return false;
}

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
