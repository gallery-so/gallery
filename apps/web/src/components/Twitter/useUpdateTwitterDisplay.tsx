import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useUpdateTwitterDisplayFragment$key } from '~/generated/useUpdateTwitterDisplayFragment.graphql';
import { useUpdateTwitterDisplayMutation } from '~/generated/useUpdateTwitterDisplayMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useUpdateTwitterDisplay(queryRef: useUpdateTwitterDisplayFragment$key) {
  const query = useFragment(
    graphql`
      fragment useUpdateTwitterDisplayFragment on Query {
        viewer {
          ... on Viewer {
            id
            socialAccounts {
              twitter {
                username
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const [updateTwitterDisplay] = usePromisifiedMutation<useUpdateTwitterDisplayMutation>(graphql`
    mutation useUpdateTwitterDisplayMutation($input: UpdateSocialAccountDisplayedInput!) {
      updateSocialAccountDisplayed(input: $input) {
        __typename
        ... on UpdateSocialAccountDisplayedPayload {
          viewer {
            ... on Viewer {
              __typename
              id
              socialAccounts {
                twitter {
                  username
                  display
                }
              }
            }
          }
        }
      }
    }
  `);

  return useCallback(
    (display: boolean) => {
      const optimisticResponse: useUpdateTwitterDisplayMutation['response'] = {
        updateSocialAccountDisplayed: {
          __typename: 'UpdateSocialAccountDisplayedPayload',
          viewer: {
            __typename: 'Viewer',
            id: query.viewer?.id ?? '',
            socialAccounts: {
              twitter: {
                username: query.viewer?.socialAccounts?.twitter?.username ?? '',
                display,
              },
            },
          },
        },
      };

      updateTwitterDisplay({
        variables: {
          input: {
            displayed: display,
            type: 'Twitter',
          },
        },
        optimisticResponse,
      });
    },
    [query.viewer?.id, query.viewer?.socialAccounts?.twitter?.username, updateTwitterDisplay]
  );
}
