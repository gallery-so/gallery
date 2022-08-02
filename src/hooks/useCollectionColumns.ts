import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMemo } from 'react';
import { DEFAULT_COLUMNS, isValidColumns } from 'constants/layout';

import { useCollectionColumnsFragment$key } from '__generated__/useCollectionColumnsFragment.graphql';

export const useCollectionColumns = (collectionRef: useCollectionColumnsFragment$key | null) => {
  const collection = useFragment(
    graphql`
      fragment useCollectionColumnsFragment on Collection {
        layout {
          sectionLayout {
            columns
          }
        }
      }
    `,
    collectionRef
  );

  return useMemo(() => {
    if (
      collection?.layout?.sectionLayout &&
      isValidColumns(collection.layout.sectionLayout[0].columns)
    ) {
      return collection.layout.sectionLayout[0].columns;
    }

    return DEFAULT_COLUMNS;
  }, [collection?.layout]);
};
