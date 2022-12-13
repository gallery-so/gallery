import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
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
        galleryById(id: $galleryId) {
          ... on Gallery {
            collections {
              name
              hidden
            }
          }
        }
      }
    `,
    queryRef
  );

  const nonNullCollections = useMemo(() => {
    return removeNullValues(query.galleryById?.collections);
  }, [query.galleryById?.collections]);

  const filteredCollections = useMemo(() => {
    if (searchQuery.length === 0) {
      return nonNullCollections;
    }

    return nonNullCollections.filter((collection) => collection.name?.includes(searchQuery));
  }, [nonNullCollections, searchQuery]);

  return (
    <VStack gap={2}>
      {filteredCollections.map((collection) => {
        return <HStack>{collection.name}</HStack>;
      })}
    </VStack>
  );
}
