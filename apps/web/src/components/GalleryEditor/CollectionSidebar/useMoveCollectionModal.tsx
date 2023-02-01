import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useMoveCollectionModalFragment$key } from '~/generated/useMoveCollectionModalFragment.graphql';

import { CollectionState, useGalleryEditorContext } from '../GalleryEditorContext';
import MoveCollectionModal from './MoveCollectionModal';

type Props = {
  collection: CollectionState;
  queryRef: useMoveCollectionModalFragment$key;
};

export default function useMoveCollectionModal({ collection, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment useMoveCollectionModalFragment on Query {
        ...MoveCollectionModalFragment
      }
    `,
    queryRef
  );
  const { moveCollectionToGallery, hasUnsavedChangesCollectionBeingEdited, saveGallery } =
    useGalleryEditorContext();

  const { showModal } = useModalActions();

  const onSuccess = useCallback(() => {
    moveCollectionToGallery(collection.dbid);
  }, [collection.dbid, moveCollectionToGallery]);

  return useCallback(() => {
    showModal({
      content: (
        <MoveCollectionModal
          collection={collection}
          hasUnsavedChanges={hasUnsavedChangesCollectionBeingEdited}
          handleSaveGallery={saveGallery}
          queryRef={query}
          onSuccess={onSuccess}
        />
      ),
    });
  }, [
    collection,
    hasUnsavedChangesCollectionBeingEdited,
    onSuccess,
    query,
    saveGallery,
    showModal,
  ]);
}
