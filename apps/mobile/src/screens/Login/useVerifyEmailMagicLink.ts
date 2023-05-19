import { graphql } from 'relay-runtime';

import { useVerifyEmailMagicLinkMutation } from '~/generated/useVerifyEmailMagicLinkMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export function useVerifyEmailMagicLink() {
  return usePromisifiedMutation<useVerifyEmailMagicLinkMutation>(graphql`
    mutation useVerifyEmailMagicLinkMutation($input: VerifyEmailMagicLinkInput!) {
      verifyEmailMagicLink(input: $input) {
        ... on VerifyEmailMagicLinkPayload {
          __typename
          canSend
        }

        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);
}
