import { useCallback, useState } from 'react';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/ToastContext';
import { usePostDeleteMutation } from '~/generated/usePostDeleteMutation.graphql';
import { usePostMutation } from '~/generated/usePostMutation.graphql';
import { usePostTokenFragment$key } from '~/generated/usePostTokenFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type PostTokensInput = {
  tokenId: string;
  caption?: string;
};

type Props = {
  tokenRef: usePostTokenFragment$key;
};

export function usePost({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment usePostTokenFragment on Token {
        __typename
        community {
          dbid
        }
      }
    `,
    tokenRef
  );

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
          __typename
          deletedId {
            __typename
            dbid
            id
          }
        }
      }
    }
  `);

  const [, setError] = useState<string | null>(null);
  const reportError = useReportError();

  const { pushToast } = useToastActions();

  const communityConnection = ConnectionHandler.getConnectionID(
    `Community:${token?.community?.dbid}`,
    'CommunityViewPostsTabFragment_posts'
  );

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
            'CuratedScreenFragment_curatedFeed'
          );

          const communityStore = store.get(communityConnection);

          const connectionName = `${connectionId}`;

          const relayStore = store.get(connectionName);

          if (relayStore) {
            const edge = ConnectionHandler.createEdge(store, relayStore, newPost, 'FeedEdge');
            ConnectionHandler.insertEdgeAfter(relayStore, edge);
          }

          if (communityStore) {
            const pageInfo = communityStore.getLinkedRecord('pageInfo');
            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) + 1, 'total');

            // Create a new edge
            const communityEdge = ConnectionHandler.createEdge(
              store,
              communityStore,
              newPost,
              'PostEdge'
            );

            // Insert the edge at the end of the connection
            ConnectionHandler.insertEdgeAfter(communityStore, communityEdge);
          }
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
    [communityConnection, pushToast, post, reportError]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      const updater: SelectorStoreUpdater<usePostDeleteMutation['response']> = (
        store,
        response
      ) => {
        if (
          response.deletePost?.__typename === 'DeletePostPayload' &&
          response.deletePost.deletedId
        ) {
          const deletedId = response.deletePost.deletedId.dbid;
          store.delete(`Post:${deletedId}`);

          const communityStore = store.get(communityConnection);

          if (communityStore) {
            const pageInfo = communityStore.getLinkedRecord('pageInfo');
            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) - 1, 'total');
          }
        }
      };
      await deletePost({
        updater,
        variables: {
          postId,
        },
      });
    },
    [communityConnection, deletePost]
  );

  return {
    post: handlePost,
    isPosting,
    deletePost: handleDelete,
    isDeletingPosting,
  };
}
