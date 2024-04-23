import { StagedItem, StagedRowList } from './types';

// This file contains helper methods to manipulate collections, layouts, and related data used for the Collection Editor and its drag and drop interface.

// Each value in the whitespace list represents the index of the NFT that a whitespace appears before.
// For example, whitespace: [0] means that there is one whitespace before the first NFT in the collection.
// Here is a more detailed example:
// If Staged items looks like this: (x is whitespace) [x, x, A, x, B, C, D, x, E, x]
// The list of NFTs would be: [A, B, C, D, E]
// The whitespace list would be : [0, 0, 1, 4, 5]

export function getWhitespacePositionsFromStagedItems(stagedItems: StagedItem[]): number[] {
  // For every token we encounter in stagedItems, increment a counter to track its position in the list of tokens.
  // For every whitespace we encounter, add the counter's value to the list of whitespace positions.
  let nftIndex = 0;
  const result: number[] = [];
  stagedItems.forEach((stagedItem) => {
    if (stagedItem.kind === 'token') {
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
export function generateLayoutFromCollection(sections: StagedRowList) {
  let sectionStartIndex = 0;
  let filteredSections = [...sections];
  sections.forEach((section) => {
    let isEmptySection = section.items.length === 0;
    if (!isEmptySection) {
      // see if it's only empty whitespace blocks
      const sectionWithoutWhitespace = section.items.filter((item) => item.kind === 'token');
      isEmptySection = sectionWithoutWhitespace.length === 0;
    }

    if (isEmptySection) {
      // delete empty section
      filteredSections = filteredSections.filter(
        (sectionToFilter) => sectionToFilter.id !== section.id
      );
    }
  });

  const sectionStartIndices = filteredSections.map((section, index) => {
    const previousSection = filteredSections[index - 1];

    if (!previousSection) {
      return sectionStartIndex;
    }

    sectionStartIndex += previousSection.items.filter((item) => item.kind === 'token').length;

    return sectionStartIndex;
  });

  return {
    sections: sectionStartIndices,
    sectionLayout: Object.values(filteredSections).map((section) => ({
      columns: section.columns,
      whitespace: getWhitespacePositionsFromSection(section.items),
    })),
  };
}

export function getWhitespacePositionsFromSection(sectionItems: StagedItem[]): number[] {
  let nftIndex = 0;
  const result: number[] = [];
  sectionItems.forEach((item) => {
    if (item.kind === 'token') {
      nftIndex++;
    } else {
      // is whitespace
      result.push(nftIndex);
    }
  });
  return result;
}
