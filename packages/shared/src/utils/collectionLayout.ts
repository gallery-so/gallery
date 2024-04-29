import { graphql, readInlineData } from 'relay-runtime';

import { collectionLayoutParseFragment$key } from '~/generated/collectionLayoutParseFragment.graphql';

import { DEFAULT_COLUMNS } from '../constants/layout';
import { removeNullValues } from '../relay/removeNullValues';
import { generate12DigitId } from './generate12DigitId';

export type WhitespaceBlock = {
  id: string;
  whitespace: 'whitespace';
};

export type Section<T> = {
  id: string;
  items: ReadonlyArray<T | WhitespaceBlock>;
  columns: number;
};
export type CollectionWithLayout<T> = Array<Section<T>>;

export type CollectionLayout = {
  sections: Array<number>;
  sectionLayout: Array<{ whitespace: ReadonlyArray<number | null> | null; columns: number | null }>;
};

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
