import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { PostTokensInput, useCreatePostMutation } from '~/generated/useCreatePostMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useCreatePost() {
  const [createPost] = usePromisifiedMutation<useCreatePostMutation>(
    graphql`
      mutation useCreatePostMutation($input: PostTokensInput!) {
        postTokens(input: $input) {
          ... on PostTokensPayload {
            post {
              __typename
            }
          }
        }
      }
    `
  );

  return useCallback(
    async (input: PostTokensInput) => {
      await createPost({ variables: { input } });
      //handle error
    },
    [createPost]
  );
}
