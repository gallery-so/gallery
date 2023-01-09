import { useEffect, useRef } from 'react';

import {
  CollectionState,
  useGalleryEditorContext,
} from '~/components/GalleryEditor/GalleryEditorContext';

function removeIdsFromCollections(collections: CollectionState[]): CollectionState[] {
  return collections.map((collection) => {
    return { ...collection, dbid: '' };
  }, []);
}

export default function useCheckUnsavedChanges(
  onHasUnsavedChange: (hasUnsavedChanges: boolean) => void
) {
  const { collections } = useGalleryEditorContext();

  const initalCollectionsRef = useRef(collections);

  useEffect(() => {
    const collectionList = removeIdsFromCollections(Object.values(collections));
    const initialCollectionsList = removeIdsFromCollections(
      Object.values(initalCollectionsRef.current)
    );

    const hasUnsavedChanged =
      JSON.stringify(collectionList) !== JSON.stringify(initialCollectionsList);

    onHasUnsavedChange(hasUnsavedChanged);
  }, [collections, onHasUnsavedChange]);
}
