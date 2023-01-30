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
  const { deleteCollection } = useGalleryEditorContext();

  const { showModal } = useModalActions();

  const onSuccess = useCallback(() => {
    deleteCollection(collection.dbid);
  }, [collection.dbid, deleteCollection]);

  return useCallback(() => {
    showModal({
      content: (
        <MoveCollectionModal collection={collection} queryRef={query} onSuccess={onSuccess} />
      ),
    });
  }, [collection, onSuccess, query, showModal]);
}
