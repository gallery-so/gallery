import { useCallback } from 'react';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { graphql } from 'relay-runtime';
import {
  UpdateTokenInfoInput,
  useUpdateNftMutation,
} from '__generated__/useUpdateNftMutation.graphql';

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
