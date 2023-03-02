import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { ErrorWithSentryMetadata } from '~/errors/ErrorWithSentryMetadata';
import {
  useUpdateCollectionInfoMutation,
  useUpdateCollectionInfoMutation$data,
} from '~/generated/useUpdateCollectionInfoMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

export default function useUpdateCollectionInfo() {
  const [updateCollection, isMutating] =
    usePromisifiedMutation<useUpdateCollectionInfoMutation>(graphql`
      mutation useUpdateCollectionInfoMutation($input: UpdateCollectionInfoInput!) {
        updateCollectionInfo(input: $input) {
          __typename
          ... on ErrInvalidInput {
            message
          }
          ... on UpdateCollectionInfoPayload {
            collection {
              id
              name
              collectorsNote
            }
          }
        }
      }
    `);

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const mutate = useCallback(
    async (collectionDbid: string, name: string, collectorsNote: string) => {
      const optimisticResponse: useUpdateCollectionInfoMutation$data = {
        updateCollectionInfo: {
          __typename: 'UpdateCollectionInfoPayload',
          collection: {
            id: `Collection:${collectionDbid}`,
            name,
            collectorsNote,
          },
        },
      };

      function handleError(_error: unknown) {
        const error =
          _error instanceof Error
            ? _error
            : new ErrorWithSentryMetadata(
                'Something unexpected went wrong while updating a collection',
                {}
              );

        reportError(error);
        pushToast({
          autoClose: true,
          message:
            "Something went wrong while trying to update your collection. We're looking into it.",
        });
      }

      const response = await updateCollection({
        optimisticResponse,
        variables: { input: { name, collectorsNote, collectionId: collectionDbid } },
      }).catch(handleError);

      if (response?.updateCollectionInfo?.__typename !== 'UpdateCollectionInfoPayload') {
        handleError(
          new ErrorWithSentryMetadata('UpdateCollectionInfo did not return expected typename', {
            __typename: response?.updateCollectionInfo?.__typename,
          })
        );
      }
    },
    [pushToast, reportError, updateCollection]
  );

  return [mutate, isMutating] as const;
}
