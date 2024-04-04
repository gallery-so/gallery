import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { collectionLayoutParseFragment$key } from '~/generated/collectionLayoutParseFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { StagedItem, StagedRowList } from './types';
import { DEFAULT_COLUMNS, generate12DigitId } from './util';
// This file contains helper methods to manipulate collections, layouts, and related data used for the Collection Editor and its drag and drop interface.

type WhitespaceBlock = {
  id: string;
  whitespace: 'whitespace';
};

type Section<T> = {
  id: string;
  items: ReadonlyArray<T | WhitespaceBlock>;
  columns: number;
};
type CollectionWithLayout<T> = Array<Section<T>>;

export function parseCollectionLayoutGraphql<T>(
  tokens: T[],
  collectionLayoutRef: collectionLayoutParseFragment$key,
  ignoreWhitespace = false
): CollectionWithLayout<T> {
  const layout = readInlineData(
    graphql`
      fragment collectionLayoutParseFragment on CollectionLayout @inline {
        sections
        sectionLayout {
          whitespace
          columns
        }
      }
    `,
    collectionLayoutRef
  );

  const sections = removeNullValues(layout?.sections ?? []);
  const sectionLayout = removeNullValues(layout?.sectionLayout ?? []);

  return parseCollectionLayout(
    tokens,
    {
      sections,
      sectionLayout,
    },
    ignoreWhitespace
  );
}

type CollectionLayout = {
  sections: Array<number>;
  sectionLayout: Array<{ whitespace: ReadonlyArray<number | null> | null; columns: number | null }>;
};

// Given a list of tokens in the collection and the collection layout settings,
// returns an object that represents the full structure of the collection layout with sections, items, and whitespace blocks.
export function parseCollectionLayout<T>(
  tokens: ReadonlyArray<T>,
  collectionLayout: CollectionLayout,
  ignoreWhitespace = false
): CollectionWithLayout<T> {
  if (tokens.length === 0) {
    return [{ id: generate12DigitId(), items: [], columns: DEFAULT_COLUMNS }];
  }

  const parsedCollection = collectionLayout.sections.reduce(
    (allSections: CollectionWithLayout<T>, sectionStartIndex: number, index: number) => {
      const nextSection = collectionLayout.sections[index + 1];
      const sectionEndIndex = nextSection ? nextSection - 1 : tokens.length;

      let section: ReadonlyArray<T | WhitespaceBlock> = tokens.slice(
        sectionStartIndex,
        sectionEndIndex + 1
      );
      if (!ignoreWhitespace) {
        section = insertWhitespaceBlocks(
          section,
          removeNullValues(collectionLayout.sectionLayout[index]?.whitespace)
        );
      }
      const sectionId = generate12DigitId();

      allSections.push({
        id: sectionId,
        items: section,
        columns: collectionLayout.sectionLayout[index]?.columns ?? 1,
      });

      return allSections;
    },
    []
  );

  return parsedCollection;
}

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
