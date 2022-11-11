import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { SetSpamPreferenceInput } from '~/generated/operations';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useSetSpamPreference() {
  const [setSpamPreference] = usePromisifiedMutation(
    graphql`
      mutation useSetSpamPreferenceMutation($input: SetSpamPreferenceInput!) {
        setSpamPreference(input: $input) {
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
      await setSpamPreference({ variables: { input } });

      // TODO: handle error cases
    },
    [setSpamPreference]
  );
}
