import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useLoggedInUserIdFragment$key } from '~/generated/useLoggedInUserIdFragment.graphql';

export const useLoggedInUserId = (queryRef: useLoggedInUserIdFragment$key) => {
  const user = useFragment(
    graphql`
      fragment useLoggedInUserIdFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    queryRef
  );

  return user?.viewer?.user?.id;
};
