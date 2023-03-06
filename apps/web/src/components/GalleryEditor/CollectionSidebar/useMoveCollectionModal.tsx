import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useMoveCollectionModalFragment$key } from '~/generated/useMoveCollectionModalFragment.graphql';

import { StagedCollection, useGalleryEditorContext } from '../GalleryEditorContext';
import MoveCollectionModal from './MoveCollectionModal';

type Props = {
  collection: StagedCollection;
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
  const { moveCollectionToGallery, doesCollectionHaveUnsavedChanges, saveGallery } =
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
          hasUnsavedChanges={doesCollectionHaveUnsavedChanges(collection.dbid)}
          handleSaveGallery={saveGallery}
          queryRef={query}
          onSuccess={onSuccess}
        />
      ),
    });
  }, [collection, doesCollectionHaveUnsavedChanges, onSuccess, query, saveGallery, showModal]);
}
