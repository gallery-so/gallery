import { useCallback, useState } from 'react';
import { graphql } from 'react-relay';

import { useToastActions } from '~/contexts/ToastContext';
import { usePostMutation } from '~/generated/usePostMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type PostTokensInput = {
  tokenId: string;
  caption?: string;
};

export function usePost() {
  const [post, isPosting] = usePromisifiedMutation<usePostMutation>(graphql`
    mutation usePostMutation($input: PostTokensInput!) {
      postTokens(input: $input) {
        ... on PostTokensPayload {
          post {
            __typename
          }
        }
      }
    }
  `);

  const [, setError] = useState<string | null>(null);
  const reportError = useReportError();

  const { pushToast } = useToastActions();

  const handlePost = useCallback(
    ({ tokenId, caption }: PostTokensInput) => {
      return post({
        variables: {
          input: {
            // Supposed to be an array of tokenIds, but we only post one at a time
            //   In future, we can use this to post multiple tokens at once
            tokenIds: [tokenId],
            caption,
          },
        },
      }).catch((error) => {
        pushToast({
          message: 'Something went wrong while posting your post.',
        });
        setError(error);
        reportError(error);
      });

      // TODO: Handle optimistic response when the feed is ready
    },
    [pushToast, post, reportError]
  );

  return {
    post: handlePost,
    isPosting,
  };
}
