import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMemo } from 'react';
import { DEFAULT_COLUMNS } from 'constants/layout';
import { isValidColumns } from 'scenes/UserGalleryPage/UserGalleryCollection';
import { useCollectionColumnsFragment$key } from '__generated__/useCollectionColumnsFragment.graphql';

export const useCollectionColumns = (collectionRef: useCollectionColumnsFragment$key | null) => {
  const collection = useFragment(
    graphql`
      fragment useCollectionColumnsFragment on GalleryCollection {
        layout {
          columns
        }
      }
    `,
    collectionRef
  );

  return useMemo(() => {
    if (collection?.layout?.columns && isValidColumns(collection.layout.columns)) {
      return collection.layout.columns;
    }

    return DEFAULT_COLUMNS;
  }, [collection?.layout]);
};
