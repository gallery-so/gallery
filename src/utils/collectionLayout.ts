import { EditModeNft } from 'flows/shared/steps/OrganizeCollection/types';
// [x, A, x, B, C, D, x, E, x]
// NFTs: [A, B, C, D, E]
// whitespace: [0, 1, 4, 5]

export function getWhitespacePositionsFromStagedNfts(stagedNfts: EditModeNft[]): number[] {
  let index = 0;
  const result: number[] = [];
  stagedNfts.forEach((stagedNft) => {
    if (stagedNft.nft) {
      // is nft
      index++;
    } else {
      // is whitespace
      result.push(index);
    }
  });

  return result;
}

export function generate12DigitId() {
  return Math.round(Math.random() * 1000000000000);
}
