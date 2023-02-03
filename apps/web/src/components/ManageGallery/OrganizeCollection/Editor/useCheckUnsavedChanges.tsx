import { useEffect, useRef } from 'react';

import {
  useCollectionMetadataState,
  useStagedCollectionState,
} from '~/contexts/collectionEditor/CollectionEditorContext';

import { formatStagedCollection } from './formatStagedCollection';

export default function useCheckUnsavedChanges(
  onHasUnsavedChange: (hasUnsavedChanges: boolean) => void
) {
  const initialStagedCollection = useRef({});
  const initialCollectionMetadata = useRef({});
  const isStagedCollectionInitialized = useRef(false);

  const stagedCollectionState = useStagedCollectionState();
  const collectionMetadataState = useCollectionMetadataState();

  // Initialize the staged collection and collection metadata ref
  useEffect(() => {
    if (Object.keys(stagedCollectionState).length === 0 || isStagedCollectionInitialized.current) {
      return;
    }

    isStagedCollectionInitialized.current = true;
    initialStagedCollection.current = formatStagedCollection(stagedCollectionState);
    initialCollectionMetadata.current = collectionMetadataState;
  }, [collectionMetadataState, stagedCollectionState]);

  // Check if the staged collection or collection metadata has changed
  useEffect(() => {
    const formattedStagedCollection = formatStagedCollection(stagedCollectionState);

    if (
      JSON.stringify(formattedStagedCollection) !==
        JSON.stringify(initialStagedCollection.current) ||
      JSON.stringify(collectionMetadataState) !== JSON.stringify(initialCollectionMetadata.current)
    ) {
      onHasUnsavedChange(true);
      return;
    }
    onHasUnsavedChange(false);
  }, [collectionMetadataState, onHasUnsavedChange, stagedCollectionState]);
}
