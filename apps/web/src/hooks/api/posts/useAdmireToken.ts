import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { ConnectionHandler, graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import { contexts } from 'shared/analytics/constants';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useAdmireTokenMutation } from '~/generated/useAdmireTokenMutation.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
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
  const router = useRouter();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

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
          message: `Added ${tokenName ? `**${tokenName}**` : 'this item'} to Bookmarks`,
          buttonProps: {
            label: isMobile ? 'View' : 'View Bookmarks',
            onClick: () => {
              router.push({
                pathname: '/[username]/bookmarks',
                query: { username: optimisticUserInfo.username },
              });
            },
            eventProperties: {
              eventElementId: 'View Bookmarks Button on Success Toast',
              eventName: 'Clicked View Bookmarks Button on Success Toast',
              eventContext: contexts.Toast,
            },
          },
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
          // Update the total count of admires in the interactions list
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');
          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');

          // Update the total count of bookmarks in the navbar tab
          const bookmarksCountConnectionID = ConnectionHandler.getConnectionID(
            `GalleryUser:${optimisticUserInfo.dbid}`,
            'GalleryNavLinksFragment_bookmarksCount'
          );
          const bookmarksCountStore = store.get(bookmarksCountConnectionID);
          if (bookmarksCountStore) {
            const pageInfo = bookmarksCountStore.getLinkedRecord('pageInfo');
            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) + 1, 'total');
          }

          // Add the bookmarked token to the bookmarks list displayed on the Bookmarks tab (if connection exists in store)
          const bookmarkedTokensConnectionID = ConnectionHandler.getConnectionID(
            `GalleryUser:${optimisticUserInfo.dbid}`,
            'BookmarkedTokenGridFragment_tokensBookmarked'
          );
          const bookmarkedTokensConnection = store.get(bookmarkedTokensConnectionID);
          const newBookmarkedToken = store.getRootField('admireToken')?.getLinkedRecord('token');
          if (newBookmarkedToken && bookmarkedTokensConnection) {
            const edge = ConnectionHandler.createEdge(
              store,
              bookmarkedTokensConnection,
              newBookmarkedToken,
              'TokenBookmarkEdge'
            );
            ConnectionHandler.insertEdgeBefore(bookmarkedTokensConnection, edge);
          }
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
        } else {
          pushSuccessToast();
        }
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
    [admire, isMobile, pushToast, reportError, router]
  );

  return [admireToken] as const;
}
