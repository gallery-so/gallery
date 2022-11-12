import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { SetSpamPreferenceInput } from '~/generated/operations';
import { useSetSpamPreferenceMutation$data } from '~/generated/useSetSpamPreferenceMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useSetSpamPreference() {
  const [setSpamPreference] = usePromisifiedMutation(
    graphql`
      mutation useSetSpamPreferenceMutation($input: SetSpamPreferenceInput!) {
        setSpamPreference(input: $input) {
          __typename
          ... on SetSpamPreferencePayload {
            tokens {
              isSpamByUser
            }
          }
        }
      }
    `
  );

  return useCallback(
    async (input: SetSpamPreferenceInput) => {
      const optimisticResponse: useSetSpamPreferenceMutation$data = {
        setSpamPreference: {
          __typename: 'SetSpamPreferencePayload',
          tokens: input.tokens.map((id) => ({ id, isSpamByUser: input.isSpam })),
        },
      };

      await setSpamPreference({ optimisticResponse, variables: { input } });

      // TODO: handle error cases
    },
    [setSpamPreference]
  );
}
