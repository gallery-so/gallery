import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import {
  CollectionListItemType,
  createVirtualizedCollectionRows,
} from '~/components/Gallery/createVirtualizedCollectionRows';
import { createVirtualizedGalleryRows$key } from '~/generated/createVirtualizedGalleryRows.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export type GalleryListItemType =
  | ({ key: string } & {
      kind: 'gallery-header';
      id: string;
      name: string | null;
      description: string | null;
    })
  | CollectionListItemType;

type createVirtualizedGalleryRowsArgs = {
  noHeader?: boolean;
  galleryRef: createVirtualizedGalleryRows$key;
};

type createVirtualizedGalleryRowsReturn = {
  items: GalleryListItemType[];
  stickyIndices: number[];
};

export function createVirtualizedGalleryRows({
  galleryRef,
  noHeader = false,
}: createVirtualizedGalleryRowsArgs): createVirtualizedGalleryRowsReturn {
  const gallery = readInlineData(
    graphql`
      fragment createVirtualizedGalleryRows on Gallery @inline {
        dbid
        name
        description

        collections {
          hidden
          ...createVirtualizedCollectionRows
        }
      }
    `,
    galleryRef
  );

  const stickyIndices: number[] = [];
  const items: GalleryListItemType[] = [];

  if (!noHeader) {
    items.push({
      kind: 'gallery-header',
      key: 'gallery-header',
      id: gallery.dbid,
      name: gallery.name,
      description: gallery.description,
    });
  }

  const filteredCollections = removeNullValues(gallery.collections).filter(
    (collection) => !collection.hidden
  );

  filteredCollections.forEach((collection) => {
    const collectionRows = createVirtualizedCollectionRows({ collectionRef: collection });

    const offset = items.length;

    items.push(...collectionRows.items);
    stickyIndices.push(...collectionRows.stickyIndices.map((index) => index + offset));
  });

  return { items, stickyIndices };
}
