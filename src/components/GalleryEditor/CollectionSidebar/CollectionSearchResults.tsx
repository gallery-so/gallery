import { useMemo } from 'react';

import { VStack } from '~/components/core/Spacer/Stack';
import { CollectionListItem } from '~/components/GalleryEditor/CollectionSidebar/CollectionListItem';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';

type CollectionSearchResultsProps = {
  searchQuery: string;
};

export function CollectionSearchResults({ searchQuery }: CollectionSearchResultsProps) {
  const { collections } = useGalleryEditorContext();

  const collectionList = useMemo(() => Object.values(collections), [collections]);

  const filteredCollections = useMemo(() => {
    if (searchQuery.length === 0) {
      return collectionList;
    }

    return collectionList.filter((collection) =>
      collection.name?.toLocaleLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collectionList, searchQuery]);

  return (
    <VStack gap={2}>
      {filteredCollections.map((collection) => {
        return <CollectionListItem key={collection.dbid} collectionId={collection.dbid} />;
      })}
    </VStack>
  );
}
