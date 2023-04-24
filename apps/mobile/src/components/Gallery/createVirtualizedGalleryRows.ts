import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { createVirtualizedGalleryRows$key } from '~/generated/createVirtualizedGalleryRows.graphql';
import { createVirtualizedGalleryRowsParseLayoutFragment$key } from '~/generated/createVirtualizedGalleryRowsParseLayoutFragment.graphql';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export type GalleryListItemType = { key: string } & (
  | {
      kind: 'gallery-header';
      name: string | null;
      description: string | null;
    }
  | { kind: 'collection-title'; name: string | null }
  | { kind: 'collection-note'; collectorsNote: string | null }
  | {
      kind: 'collection-row';
      items: Array<WhitespaceBlock | GalleryTokenPreviewFragment$key>;
      columns: number;
    }
);

type createVirtualizedGalleryRowsArgs = {
  galleryRef: createVirtualizedGalleryRows$key;
};

type createVirtualizedGalleryRowsReturn = {
  items: GalleryListItemType[];
  stickyIndices: number[];
};

export function createVirtualizedGalleryRows({
  galleryRef,
}: createVirtualizedGalleryRowsArgs): createVirtualizedGalleryRowsReturn {
  const gallery = readInlineData(
    graphql`
      fragment createVirtualizedGalleryRows on Gallery @inline {
        name
        description

        collections {
          name
          collectorsNote

          tokens {
            __typename
            ...GalleryTokenPreviewFragment
          }

          layout {
            ...createVirtualizedGalleryRowsParseLayoutFragment
          }
        }
      }
    `,
    galleryRef
  );

  const stickyIndices: number[] = [];
  const items: GalleryListItemType[] = [];

  items.push({
    kind: 'gallery-header',
    key: 'gallery-header',
    name: gallery.name,
    description: gallery.description,
  });

  const nonNullCollections = removeNullValues(gallery.collections);
  nonNullCollections.forEach((collection) => {
    items.push({
      kind: 'collection-title',
      key: `collection-title-${collection.name}`,
      name: collection.name,
    });

    stickyIndices.push(items.length - 1);

    items.push({
      kind: 'collection-note',
      key: `collection-note-${collection.name}`,
      collectorsNote: collection.collectorsNote,
    });

    // +1 is here to account for the header above
    const nonNullTokens = removeNullValues(collection.tokens);

    if (collection.layout) {
      const sections = parseCollectionLayoutGraphql(nonNullTokens, collection.layout);
      for (const section of sections) {
        for (let i = 0; i < section.items.length; i += section.columns) {
          const rowItems = section.items.slice(i, i + section.columns);

          items.push({
            kind: 'collection-row',
            key: `collection-row-${section.id}-${i}`,
            columns: section.columns,
            items: rowItems,
          });
        }
      }
    }
  });

  return { items, stickyIndices };
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
  collectionLayoutRef: createVirtualizedGalleryRowsParseLayoutFragment$key,
  ignoreWhitespace = false
): CollectionWithLayout<T> {
  const layout = readInlineData(
    graphql`
      fragment createVirtualizedGalleryRowsParseLayoutFragment on CollectionLayout @inline {
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
