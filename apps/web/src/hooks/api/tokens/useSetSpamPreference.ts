import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useSetSpamPreferenceMutation } from '~/generated/useSetSpamPreferenceMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

interface Token {
  id: string;
  dbid: string;
}

interface SetSpamPreferenceArgs {
  tokens: Token[];
  isSpam: boolean;
}

export default function useSetSpamPreference() {
  const [setSpamPreference] = usePromisifiedMutation<useSetSpamPreferenceMutation>(
    graphql`
      mutation useSetSpamPreferenceMutation($input: SetSpamPreferenceInput!) @raw_response_type {
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
    async ({ tokens, isSpam }: SetSpamPreferenceArgs) => {
      const optimisticResponse: useSetSpamPreferenceMutation['rawResponse'] = {
        setSpamPreference: {
          __typename: 'SetSpamPreferencePayload',
          tokens: tokens.map(({ id }) => ({ id, isSpamByUser: isSpam })),
        },
      };

      await setSpamPreference({
        optimisticResponse,
        variables: { input: { tokens: tokens.map(({ dbid }) => dbid), isSpam } },
      });

      // TODO: handle error cases
    },
    [setSpamPreference]
  );
}
