import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import {
  UpdateTokenInfoInput,
  useUpdateNftMutation,
} from '~/generated/useUpdateNftMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useUpdateNft() {
  const [updateNft] = usePromisifiedMutation<useUpdateNftMutation>(
    graphql`
      mutation useUpdateNftMutation($input: UpdateTokenInfoInput!) {
        updateTokenInfo(input: $input) {
          ... on UpdateTokenInfoPayload {
            token {
              collectorsNote
            }
          }
        }
      }
    `
  );

  return useCallback(
    async (input: UpdateTokenInfoInput) => {
      await updateNft({ variables: { input } });

      // TODO: handle error cases
    },
    [updateNft]
  );
}
