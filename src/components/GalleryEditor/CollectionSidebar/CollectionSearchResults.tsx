import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { VStack } from '~/components/core/Spacer/Stack';
import { CollectionListItem } from '~/components/GalleryEditor/CollectionSidebar/CollectionListItem';
import { CollectionSearchResultsFragment$key } from '~/generated/CollectionSearchResultsFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';

type CollectionSearchResultsProps = {
  searchQuery: string;
  queryRef: CollectionSearchResultsFragment$key;
};

export function CollectionSearchResults({ queryRef, searchQuery }: CollectionSearchResultsProps) {
  const query = useFragment(
    graphql`
      fragment CollectionSearchResultsFragment on Query {
        viewer {
          ... on Viewer {
            viewerGalleries {
              gallery {
                collections {
                  dbid
                  name

                  ...CollectionListItemFragment
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const nonNullCollections = useMemo(() => {
    return removeNullValues(query.viewer?.viewerGalleries?.[0]?.gallery?.collections);
  }, [query.viewer?.viewerGalleries]);

  const filteredCollections = useMemo(() => {
    if (searchQuery.length === 0) {
      return nonNullCollections;
    }

    return nonNullCollections.filter((collection) =>
      collection.name?.toLocaleLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nonNullCollections, searchQuery]);

  return (
    <VStack gap={2}>
      {filteredCollections.map((collection) => {
        return <CollectionListItem key={collection.dbid} collectionRef={collection} />;
      })}
    </VStack>
  );
}
