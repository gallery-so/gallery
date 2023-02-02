import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useMoveCollectionToGalleryMutation } from '~/generated/useMoveCollectionToGalleryMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

type Props = {
  collectionId: string;
  galleryId: string;
  onSucess: () => void;
};

export default function useMoveCollectionToGallery() {
  const [moveCollectionToGallery] =
    usePromisifiedMutation<useMoveCollectionToGalleryMutation>(graphql`
      mutation useMoveCollectionToGalleryMutation($input: MoveCollectionToGalleryInput!)
      @raw_response_type {
        moveCollectionToGallery(input: $input) {
          __typename
          ... on MoveCollectionToGalleryPayload {
            oldGallery {
              dbid
              name
            }
            newGallery {
              dbid
              name
            }
          }
          ... on ErrInvalidInput {
            __typename
          }
        }
      }
    `);

  const { pushToast } = useToastActions();

  return useCallback(
    async ({ collectionId, galleryId, onSucess }: Props) => {
      try {
        const response = await moveCollectionToGallery({
          variables: {
            input: {
              sourceCollectionId: collectionId,
              targetGalleryId: galleryId,
            },
          },
        });

        if (response?.moveCollectionToGallery?.__typename === 'MoveCollectionToGalleryPayload') {
          onSucess();
          return;
        }

        pushToast({
          message: 'Unfortunately there was an error to move your collection',
          autoClose: false,
        });
      } catch (error) {
        if (error instanceof Error) {
          pushToast({
            message: 'Unfortunately there was an error to move your collection',
            autoClose: false,
          });
        }
      }
    },
    [pushToast, moveCollectionToGallery]
  );
}
