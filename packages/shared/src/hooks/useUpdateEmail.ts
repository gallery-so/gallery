import { useCallback } from 'react';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useUpdateEmailMutation } from '~/generated/useUpdateEmailMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

export default function useUpdateEmail() {
  const [updateEmail] = usePromisifiedMutation<useUpdateEmailMutation>(graphql`
    mutation useUpdateEmailMutation($input: UpdateEmailInput!) @raw_response_type {
      updateEmail(input: $input) {
        __typename
        ... on UpdateEmailPayload {
          __typename
          viewer {
            email {
              email
              verificationStatus
            }
          }
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback(
    (email: string, updater?: SelectorStoreUpdater<useUpdateEmailMutation['response']>) => {
      return updateEmail({
        variables: {
          input: {
            email,
          },
        },
        updater,
      });
    },
    [updateEmail]
  );
}
