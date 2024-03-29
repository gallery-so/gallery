import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { createVirtualizedCollectionRows$key } from '~/generated/createVirtualizedCollectionRows.graphql';
import { createVirtualizedCollectionRowsParseLayoutFragment$key } from '~/generated/createVirtualizedCollectionRowsParseLayoutFragment.graphql';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export type CollectionListItemType = { key: string } & (
  | { kind: 'collection-title'; name: string | null; id: string }
  | { kind: 'collection-note'; collectorsNote: string | null }
  | {
      kind: 'collection-row';
      isFirst: boolean;
      isLast: boolean;
      columns: number;
      items: Array<WhitespaceBlock | GalleryTokenPreviewFragment$key>;
    }
);

type createVirtualizedCollectionRowsArgs = {
  collectionRef: createVirtualizedCollectionRows$key;
};

type createVirtualizedCollectionRowsReturn = {
  items: CollectionListItemType[];
  stickyIndices: number[];
};

export function createVirtualizedCollectionRows({
  collectionRef,
}: createVirtualizedCollectionRowsArgs): createVirtualizedCollectionRowsReturn {
  const collection = readInlineData(
    graphql`
      fragment createVirtualizedCollectionRows on Collection @inline {
        dbid
        name
        collectorsNote

        tokens {
          __typename
          ...GalleryTokenPreviewFragment
        }

        layout {
          ...createVirtualizedCollectionRowsParseLayoutFragment
        }
      }
    `,
    collectionRef
  );

  const stickyIndices: number[] = [];
  const items: CollectionListItemType[] = [];

  items.push({
    kind: 'collection-title',
    id: collection.dbid,
    key: `collection-title-${collection.dbid}`,
    name: `${collection.name}`,
  });

  stickyIndices.push(items.length - 1);

  items.push({
    kind: 'collection-note',
    key: `collection-note-${collection.dbid}`,
    collectorsNote: collection.collectorsNote,
  });

  // +1 is here to account for the header above
  const nonNullTokens = removeNullValues(collection.tokens);

  if (collection.layout) {
    const sections = parseCollectionLayoutGraphql(nonNullTokens, collection.layout);
    sections.forEach((section, sectionIndex) => {
      const rowCount = Math.ceil(section.items.length / section.columns);
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const sectionColumnIndex = rowIndex * section.columns;

        const rowItems = section.items.slice(
          sectionColumnIndex,
          sectionColumnIndex + section.columns
        );

        const isFirstRow = sectionIndex === 0 && rowIndex === 0;
        const isLastRow = sectionIndex === sections.length - 1 && rowIndex === rowCount - 1;

        items.push({
          kind: 'collection-row',
          key: `collection-row-${section.id}-${rowIndex}`,
          items: rowItems,
          columns: section.columns,
          isFirst: isFirstRow,
          isLast: isLastRow,
        });
      }
    });
  }

  return {
    items,
    stickyIndices,
  };
}

const DEFAULT_COLUMNS = 3;

type CollectionLayout = {
  sections: Array<number>;
  sectionLayout: Array<{ whitespace: ReadonlyArray<number | null> | null; columns: number | null }>;
};

type Section<T> = {
  id: string;
  items: ReadonlyArray<T | WhitespaceBlock>;
  columns: number;
};

type CollectionWithLayout<T> = Array<Section<T>>;

export function parseCollectionLayoutGraphql<T>(
  tokens: T[],
  collectionLayoutRef: createVirtualizedCollectionRowsParseLayoutFragment$key,
  ignoreWhitespace = false
): CollectionWithLayout<T> {
  const layout = readInlineData(
    graphql`
      fragment createVirtualizedCollectionRowsParseLayoutFragment on CollectionLayout @inline {
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

export type WhitespaceBlock = {
  id: string;
  whitespace: 'whitespace';
};

export function generate12DigitId() {
  return Math.round(Math.random() * 1000000000000).toString();
}
