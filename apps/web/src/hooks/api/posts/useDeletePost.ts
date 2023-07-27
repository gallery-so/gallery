import { useCallback } from 'react';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useDeletePostMutation } from '~/generated/useDeletePostMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useDeletePost() {
  const [deletePost] = usePromisifiedMutation<useDeletePostMutation>(graphql`
    mutation useDeletePostMutation($postId: DBID!) @raw_response_type {
      deletePost(postId: $postId) {
        ... on DeletePostPayload {
          __typename
        }
      }
    }
  `);

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  return useCallback(
    async (postDbid: string) => {
      const updater: SelectorStoreUpdater<useDeletePostMutation['response']> = (
        store,
        response
      ) => {
        if (response.deletePost?.__typename === 'DeletePostPayload') {
          store.delete(`Post:${postDbid}`);
        }
      };

      try {
        const response = await deletePost({
          updater,
          variables: {
            postId: postDbid,
          },
        });

        if (response?.deletePost?.__typename === 'DeletePostPayload') {
          pushToast({
            autoClose: true,
            message: `Your post has been deleted.`,
          });
        } else {
          pushToast({
            autoClose: true,
            message: `Something went wrong while deleting this post. We're looking into it.`,
          });
        }
        return;
      } catch (error) {
        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError(`Could not remove admire on post for an unknown reason`);
        }
        throw error;
      }
    },
    [deletePost, pushToast, reportError]
  );
}
