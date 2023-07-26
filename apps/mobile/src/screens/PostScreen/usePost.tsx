import { useCallback, useState } from 'react';
import { ConnectionHandler, graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/ToastContext';
import { usePostDeleteMutation } from '~/generated/usePostDeleteMutation.graphql';
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
            dbid
            id
            ...FeedListFragment
            ...createVirtualizedFeedEventItemsPostFragment
          }
        }
      }
    }
  `);

  const [deletePost, isDeletingPosting] = usePromisifiedMutation<usePostDeleteMutation>(graphql`
    mutation usePostDeleteMutation($postId: DBID!) {
      deletePost(postId: $postId) {
        ... on DeletePostPayload {
          deletedId {
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
      const updater: SelectorStoreUpdater<usePostMutation['response']> = (store, response) => {
        if (response.postTokens?.post?.__typename === 'Post') {
          // Get the new post
          const newPost = store.get(response.postTokens.post.id);
          if (!newPost) {
            return;
          }

          // Get the connection
          const rootRecord = store.getRoot();
          const connectionId = ConnectionHandler.getConnectionID(
            rootRecord.getDataID(),
            'WorldwideFeedFragment_globalFeed'
          );

          const relayStore = store.get(connectionId);

          if (!relayStore) {
            return;
          }

          // Create a new edge
          const edge = ConnectionHandler.createEdge(store, relayStore, newPost, 'FeedEdge');

          // Insert the edge at the end of the connection
          ConnectionHandler.insertEdgeAfter(relayStore, edge);
        }
      };

      return post({
        updater,
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
    },
    [pushToast, post, reportError]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      await deletePost({
        variables: {
          postId,
        },
      });
    },
    [deletePost]
  );

  return {
    post: handlePost,
    isPosting,
    deletePost: handleDelete,
    isDeletingPosting,
  };
}
