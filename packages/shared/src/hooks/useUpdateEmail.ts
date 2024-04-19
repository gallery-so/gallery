import { useCallback } from 'react';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';

import { AuthMechanism, useUpdateEmailMutation } from '~/generated/useUpdateEmailMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

type UpdateEmailProps = {
  email: string;
  authMechanism?: AuthMechanism;
  updater?: SelectorStoreUpdater<useUpdateEmailMutation['response']>;
};

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
    ({ email, authMechanism, updater }: UpdateEmailProps) => {
      return updateEmail({
        variables: {
          input: {
            email,
            authMechanism,
          },
        },
        updater,
      });
    },
    [updateEmail]
  );
}
