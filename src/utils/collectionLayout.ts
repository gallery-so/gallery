import {
  EditModeTokenChild,
  isEditModeToken,
  StagingItem,
  WhitespaceBlock,
} from 'flows/shared/steps/OrganizeCollection/types';
// This file contains helper methods to manipulate collections, layouts, and related data used for the Collection Editor and its drag and drop interface.

// Each value in the whitespace list represents the index of the NFT that a whitespace appears before.
// For example, whitespace: [0] means that there is one whitespace before the first NFT in the collection.
// Here is a more detailed example:
// If Staged items looks like this: (x is whitespace) [x, x, A, x, B, C, D, x, E, x]
// The list of NFTs would be: [A, B, C, D, E]
// The whitespace list would be : [0, 0, 1, 4, 5]

export function getWhitespacePositionsFromStagedItems(stagedItems: StagingItem[]): number[] {
  // For every token we encounter in stagedItems, increment a counter to track its position in the list of tokens.
  // For every whitespace we encounter, add the counter's value to the list of whitespace positions.
  let nftIndex = 0;
  const result: number[] = [];
  stagedItems.forEach((stagedItem) => {
    if (isEditModeToken(stagedItem)) {
      nftIndex++;
    } else {
      // is whitespace
      result.push(nftIndex);
    }
  });

  return result;
}

// Given a collection of sections and their items, return an object representing the layout of the collection.
// The layout object corresponds to the `CollectionLayoutInput`input type in the GraphQL API.
export function generateLayoutFromCollection(collection) {
  const sectionStartIndices = Object.keys(collection).map((sectionId, index) => {
    if (index === 0) {
      return 0;
    }
    const previousSection = collection[Object.keys(collection)[index - 1]];
    return previousSection.items.filter((item) => isEditModeToken(item)).length;
  });

  return {
    sections: sectionStartIndices,
    sectionLayout: Object.keys(collection).map((sectionId) => ({
      columns: collection[sectionId].columns,
      whitespace: getWhitespacePositionsFromSection(collection[sectionId].items),
    })),
  };
}

// Given a collection of sections and their items, return a list of just the token ids in the collection.
export function getTokenIdsFromCollection(collection) {
  const tokens = removeWhitespacesFromStagedItems(
    Object.keys(collection).flatMap((sectionId) => collection[sectionId].items)
  );
  return tokens.map((token) => token.dbid);
}

export function getWhitespacePositionsFromSection(sectionItems: any): number[] {
  let nftIndex = 0;
  const result: number[] = [];
  sectionItems.forEach((item) => {
    if (isEditModeToken(item)) {
      nftIndex++;
    } else {
      // is whitespace
      result.push(nftIndex);
    }
    // stagedCollection[sectionId].items.forEach((stagedItem) => {
    // });
  });
  return result;
}

export function generate12DigitId() {
  return Math.round(Math.random() * 1000000000000).toString();
}

// filter whitespaces from stagedItems and map each EditModeToken -> Nft
export function removeWhitespacesFromStagedItems(stagedItems: StagingItem[]) {
  return stagedItems.reduce((filtered: EditModeTokenChild[], item) => {
    if (isEditModeToken(item)) {
      filtered.push(item.token);
    }

    return filtered;
  }, []);
}

export function insertWhitespaceBlocks<T>(
  items: ReadonlyArray<T>,
  whitespaceList: number[]
): Array<T | WhitespaceBlock> {
  const result: Array<T | WhitespaceBlock> = [...items];
  // Insert whitespace blocks into the list of items to stage according to the saved whitespace indexes.
  // Offset the index to insert at by the number of whitespaces already added
  whitespaceList.forEach((index, offset) =>
    result.splice(index + offset, 0, {
      id: `blank-${generate12DigitId()}`,
      whitespace: 'whitespace',
    })
  );

  return result;
}
