import {
  EditModeTokenChild,
  isEditModeToken,
  StagedCollection,
  StagingItem,
  WhitespaceBlock,
} from 'flows/shared/steps/OrganizeCollection/types';
// This file contains helper methods to manipulate collections, layouts, and related data used for the Collection Editor and its drag and drop interface.

type Section<T> = {
  items: ReadonlyArray<T | WhitespaceBlock>;
  columns: number;
};
type CollectionWithLayout<T> = Record<string, Section<T>>;

// Given a list of tokens in the collection and the collection layout settings,
// returns an object that represents the full structure of the collection layout with sections, items, and whitespace blocks.
export function parseCollectionLayout<T>(
  tokens: ReadonlyArray<T>,

  // Hard to type this, need a second look
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collectionLayout: any,
  ignoreWhitespace = false
): CollectionWithLayout<T> {
  const parsedCollection = collectionLayout.sections.reduce(
    (allSections: CollectionWithLayout<T>, sectionStartIndex: number, index: number) => {
      const sectionEndIndex = collectionLayout.sections[index + 1]
        ? collectionLayout.sections[index + 1] - 1
        : tokens.length;
      let section: ReadonlyArray<T | WhitespaceBlock> = tokens.slice(
        sectionStartIndex,
        sectionEndIndex + 1
      );
      if (!ignoreWhitespace) {
        section = insertWhitespaceBlocks(section, collectionLayout.sectionLayout[index].whitespace);
      }
      const sectionId = generate12DigitId();
      allSections[sectionId] = {
        items: section,
        columns: collectionLayout.sectionLayout[index].columns,
      };
      return allSections;
    },
    {}
  );

  return parsedCollection;
}

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
export function generateLayoutFromCollection(collection: StagedCollection) {
  let sectionStartIndex = 0;
  const filteredCollection = { ...collection };
  Object.keys(collection).forEach((sectionId) => {
    let isEmptySection = collection[sectionId].items.length === 0;
    if (!isEmptySection) {
      // see if it's only empty whitespace blocks
      const sectionWithoutWhitespace = collection[sectionId].items.filter((item) =>
        isEditModeToken(item)
      );
      isEmptySection = sectionWithoutWhitespace.length === 0;
    }

    if (isEmptySection) {
      // delete empty section
      delete filteredCollection[sectionId];
    }
  });

  const sectionStartIndices = Object.keys(filteredCollection).map((sectionId, index) => {
    if (index === 0) {
      return sectionStartIndex;
    }
    const previousSection = filteredCollection[Object.keys(filteredCollection)[index - 1]];
    sectionStartIndex += previousSection.items.filter((item) => isEditModeToken(item)).length;
    return sectionStartIndex;
  });

  return {
    sections: sectionStartIndices,
    sectionLayout: Object.keys(filteredCollection).map((sectionId) => ({
      columns: filteredCollection[sectionId].columns,
      whitespace: getWhitespacePositionsFromSection(filteredCollection[sectionId].items),
    })),
  };
}

// Given a collection of sections and their items, return a list of just the token ids in the collection.
export function getTokenIdsFromCollection(collection: StagedCollection) {
  const tokens = removeWhitespacesFromStagedItems(
    Object.keys(collection).flatMap((sectionId) => collection[sectionId].items)
  );
  return tokens.map((token) => token.dbid);
}

export function getWhitespacePositionsFromSection(sectionItems: StagingItem[]): number[] {
  let nftIndex = 0;
  const result: number[] = [];
  sectionItems.forEach((item) => {
    if (isEditModeToken(item)) {
      nftIndex++;
    } else {
      // is whitespace
      result.push(nftIndex);
    }
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
