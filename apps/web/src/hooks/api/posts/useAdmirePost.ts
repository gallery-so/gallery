import { useCallback } from 'react';
import { ConnectionHandler, graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useAdmirePostMutation } from '~/generated/useAdmirePostMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import { OptimisticUserInfo } from '~/utils/useOptimisticUserInfo';

export default function useAdmirePost() {
  const [admire] = usePromisifiedMutation<useAdmirePostMutation>(graphql`
    mutation useAdmirePostMutation($postId: DBID!, $connections: [ID!]!) @raw_response_type {
      admirePost(postId: $postId) {
        ... on AdmirePostPayload {
          __typename
          post {
            viewerAdmire @appendNode(edgeTypeName: "PostAdmireEdge", connections: $connections) {
              dbid
              ...AdmireNoteFragment
            }
          }
        }
      }
    }
  `);

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const admirePost = useCallback(
    async (postId: string, postDbid: string, optimisticUserInfo: OptimisticUserInfo) => {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        postId,
        'Interactions_previewAdmires'
      );
      const admireModalConnection = ConnectionHandler.getConnectionID(
        postId,
        'AdmiresModal_admires'
      );

      const errorMetadata: AdditionalContext['tags'] = {
        postId: postDbid,
      };

      function pushErrorToast() {
        pushToast({
          autoClose: true,
          message: `Something went wrong while admiring this post. We're actively looking into it.`,
        });
      }

      const updater: SelectorStoreUpdater<useAdmirePostMutation['response']> = (
        store,
        response
      ) => {
        if (response?.admirePost?.__typename === 'AdmirePostPayload') {
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
        }
      };

      const optimisticId = Math.random().toString();
      const hasProfileImage = Boolean(optimisticUserInfo.profileImageUrl);

      const tokenProfileImagePayload = hasProfileImage
        ? {
            token: {
              dbid: 'unknown',
              id: 'unknown',
              media: {
                __typename: 'ImageMedia',
                fallbackMedia: {
                  mediaURL: optimisticUserInfo.profileImageUrl,
                },
                previewURLs: {
                  large: optimisticUserInfo.profileImageUrl,
                  medium: optimisticUserInfo.profileImageUrl,
                  small: optimisticUserInfo.profileImageUrl,
                },
              },
            },
          }
        : { token: null };

      try {
        const response = await admire({
          updater,
          optimisticUpdater: updater,
          optimisticResponse: {
            admirePost: {
              __typename: 'AdmirePostPayload',
              post: {
                id: postId,
                viewerAdmire: {
                  __typename: 'Admire',
                  admirer: {
                    id: optimisticUserInfo.id ?? 'unknown',
                    dbid: optimisticUserInfo.dbid ?? 'unknown',
                    username: optimisticUserInfo.username ?? null,
                    profileImage: {
                      __typename: 'TokenProfileImage',
                      ...tokenProfileImagePayload,
                    },
                  },
                  id: `Admire:${optimisticId}`,
                  dbid: optimisticId,
                },
              },
            },
          },
          variables: {
            postId: postDbid,
            connections: [interactionsConnection, admireModalConnection],
          },
        });

        if (response.admirePost?.__typename !== 'AdmirePostPayload') {
          pushErrorToast();

          reportError(`Could not admire post, typename was ${response.admirePost?.__typename}`, {
            tags: errorMetadata,
          });
        }
      } catch (error) {
        pushErrorToast();

        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError(`Could not admire post for an unknown reason`, {
            tags: errorMetadata,
          });
        }
      }
    },
    [admire, pushToast, reportError]
  );

  return [admirePost] as const;
}
