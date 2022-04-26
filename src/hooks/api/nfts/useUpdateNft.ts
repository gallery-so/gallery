import { useCallback } from 'react';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { graphql } from 'relay-runtime';
import {
  UpdateNftInfoInput,
  useUpdateNftMutation,
} from '__generated__/useUpdateNftMutation.graphql';

export default function useUpdateNft() {
  const [updateNft] = usePromisifiedMutation<useUpdateNftMutation>(
    graphql`
      mutation useUpdateNftMutation($input: UpdateNftInfoInput!) {
        updateNftInfo(input: $input) {
          ... on UpdateNftInfoPayload {
            nft {
              collectorsNote
            }
          }
        }
      }
    `
  );

  return useCallback(
    async (input: UpdateNftInfoInput) => {
      await updateNft({ variables: { input } });

      // TODO: handle error cases
    },
    [updateNft]
  );
}
