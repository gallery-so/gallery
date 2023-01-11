import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useUpdateGalleryHiddenMutation } from '~/generated/useUpdateGalleryHiddenMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useUpdateGalleryHidden() {
  const [updateGalleryHidden] = usePromisifiedMutation<useUpdateGalleryHiddenMutation>(graphql`
    mutation useUpdateGalleryHiddenMutation($input: UpdateGalleryHiddenInput!) @raw_response_type {
      updateGalleryHidden(input: $input) {
        ... on UpdateGalleryHiddenPayload {
          gallery {
            id
          }
        }

        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback(
    (id: string, hidden: boolean) => {
      return updateGalleryHidden({
        variables: {
          input: {
            id,
            hidden,
          },
        },
        updater: (store) => {
          const viewer = store.getRoot().getLinkedRecord('viewer');
          const galleries = viewer?.getLinkedRecord('user')?.getLinkedRecords('galleries');
          const gallery = galleries?.find((gallery) => gallery.getValue('dbid') === id);

          if (!gallery) {
            return;
          }

          gallery.setValue(hidden, 'hidden');
        },
      });
    },
    [updateGalleryHidden]
  );
}
