import { EditModeNft } from 'flows/shared/steps/OrganizeCollection/types';
import { Nft } from 'types/Nft';

// Each item in the resulting whitespace list represents a single whitespace, and the number is the index of the NFT that it appears before.
// Example of how the whitespace positions are generated from a list of staged items:
// staged items (x is whitespace): [x, A, x, B, C, D, x, E, x]
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

// filter whitespaces from stagedNfts and map each EditModeNft -> Nft
export function removeWhitespacesFromStagedNfts(stagedNfts: EditModeNft[]) {
  return stagedNfts.reduce((filtered: Nft[], { nft }) => {
    if (nft) {
      filtered.push(nft);
    }

    return filtered;
  }, []);
}
