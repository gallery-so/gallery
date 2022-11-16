import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useVerifyEmailOnPageMutation } from '~/generated/useVerifyEmailOnPageMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useVerifyEmailActivation() {
  const [verifyEmailMutate] = usePromisifiedMutation<useVerifyEmailOnPageMutation>(graphql`
    mutation useVerifyEmailOnPageMutation($token: String!) @raw_response_type {
      verifyEmail(token: $token) {
        ... on VerifyEmailPayload {
          __typename
          email
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  const updater: SelectorStoreUpdater<useVerifyEmailOnPageMutation['response']> = (
    store,
    response
  ) => {
    if (response.verifyEmail?.__typename === 'VerifyEmailPayload' && response.verifyEmail?.email) {
      store
        .get('client:root:viewer')
        ?.getLinkedRecord('email')
        ?.setValue('Verified', 'verificationStatus');
    }
  };

  return useCallback(
    (token: string) => {
      return verifyEmailMutate({
        variables: { token },
        updater,
      });
    },
    [verifyEmailMutate]
  );
}
