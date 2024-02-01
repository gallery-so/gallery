import { useCallback } from 'react';
import { ConnectionHandler, graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useAdmireTokenMutation } from '~/generated/useAdmireTokenMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import { OptimisticUserInfo } from '~/utils/useOptimisticUserInfo';

export default function useAdmireToken() {
  const [admire] = usePromisifiedMutation<useAdmireTokenMutation>(graphql`
    mutation useAdmireTokenMutation($tokenId: DBID!, $connections: [ID!]!) @raw_response_type {
      admireToken(tokenId: $tokenId) {
        ... on AdmireTokenPayload {
          __typename
          token {
            viewerAdmire @appendNode(edgeTypeName: "TokenAdmireEdge", connections: $connections) {
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

  const admireToken = useCallback(
    async (
      tokenId: string,
      tokenDbid: string,
      optimisticUserInfo: OptimisticUserInfo,
      tokenName?: string | null
    ) => {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        tokenId,
        'Interactions_previewAdmires'
      );
      const admireModalConnection = ConnectionHandler.getConnectionID(
        tokenId,
        'AdmiresModal_admires'
      );

      const errorMetadata: AdditionalContext['tags'] = {
        tokenId: tokenDbid,
      };

      function pushSuccessToast() {
        pushToast({
          autoClose: true,
          message: `Added ${tokenName ?? 'this item'} to Bookmarks`,
        });
      }

      function pushErrorToast() {
        pushToast({
          autoClose: true,
          message: `Something went wrong while admiring this token. We're actively looking into it.`,
        });
      }

      const updater: SelectorStoreUpdater<useAdmireTokenMutation['response']> = (
        store,
        response
      ) => {
        if (response?.admireToken?.__typename === 'AdmireTokenPayload') {
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
              definition: {
                id: 'unknown2',
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
            },
          }
        : { token: null };

      try {
        const response = await admire({
          updater,
          optimisticUpdater: updater,
          optimisticResponse: {
            admireToken: {
              __typename: 'AdmireTokenPayload',
              token: {
                id: tokenId,
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
            tokenId: tokenDbid,
            connections: [interactionsConnection, admireModalConnection],
          },
        });

        if (response.admireToken?.__typename !== 'AdmireTokenPayload') {
          pushErrorToast();

          reportError(`Could not admire token, typename was ${response.admireToken?.__typename}`, {
            tags: errorMetadata,
          });
        }
        pushSuccessToast();
      } catch (error) {
        pushErrorToast();

        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError(`Could not admire token for an unknown reason`, {
            tags: errorMetadata,
          });
        }
      }
    },
    [admire, pushToast, reportError]
  );

  return [admireToken] as const;
}
