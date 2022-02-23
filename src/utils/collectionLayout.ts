import { isEditModeNft, StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import { Nft } from 'types/Nft';

// Each value in the whitespace list represents the index of the NFT that a whitespace appears before.
// For example, whitespace: [0] means that there is one whitespace before the first NFT in the collection.
// Here is a more detailed example:
// If Staged items looks like this: (x is whitespace) [x, x, A, x, B, C, D, x, E, x]
// The list of NFTs would be: [A, B, C, D, E]
// The whitespace list would be : [0, 0, 1, 4, 5]

export function getWhitespacePositionsFromStagedItems(stagedItems: StagingItem[]): number[] {
  // For every nft we encounter in stagedItems, increment a counter to track its position in the list of nfts.
  // For every whitespace we encounter, add the counter's value to the list of whitespace positions.
  let nftIndex = 0;
  const result: number[] = [];
  stagedItems.forEach((stagedItem) => {
    if (isEditModeNft(stagedItem)) {
      nftIndex++;
    } else {
      // is whitespace
      result.push(nftIndex);
    }
  });

  return result;
}

export function generate12DigitId() {
  return Math.round(Math.random() * 1000000000000);
}

// filter whitespaces from stagedItems and map each EditModeNft -> Nft
export function removeWhitespacesFromStagedItems(stagedItems: StagingItem[]) {
  return stagedItems.reduce((filtered: Nft[], item) => {
    if (isEditModeNft(item)) {
      filtered.push(item.nft);
    }

    return filtered;
  }, []);
}
