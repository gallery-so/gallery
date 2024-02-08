import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import { ButtonChip } from '~/components/ButtonChip';

import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';
import { useToggleAdmireRemoveMutation } from '~/generated/useToggleAdmireRemoveMutation.graphql';
import { useToggleTokenAdmireAddMutation } from '~/generated/useToggleTokenAdmireAddMutation.graphql';
import { useToggleTokenAdmireFragment$key } from '~/generated/useToggleTokenAdmireFragment.graphql';
import { useToggleTokenAdmireQueryFragment$key } from '~/generated/useToggleTokenAdmireQueryFragment.graphql';
import { useToggleTokenAdmireRemoveMutation } from '~/generated/useToggleTokenAdmireRemoveMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import { useNavigation } from '@react-navigation/native';
import { MainTabStackNavigatorProp, RootStackNavigatorProp } from '~/navigation/types';
type Args = {
  queryRef: useToggleTokenAdmireQueryFragment$key;
  tokenRef: useToggleTokenAdmireFragment$key;
};

export function useToggleTokenAdmire({ tokenRef, queryRef }: Args) {
  const query = useFragment(
    graphql`
      fragment useToggleTokenAdmireQueryFragment on Query {
        viewer {
          __typename

          ... on Viewer {
            user {
              id
              dbid
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const token = useFragment(
    graphql`
      fragment useToggleTokenAdmireFragment on Token {
        id
        dbid
        definition {
          __typename
          id
          name
        }

        viewerAdmire {
          id
          dbid
        }
      }
    `,
    tokenRef
  );

  const reportError = useReportError();
  const { pushToast } = useToastActions();

  const [admire] = usePromisifiedMutation<useToggleTokenAdmireAddMutation>(graphql`
    mutation useToggleTokenAdmireAddMutation($tokenId: DBID!) @raw_response_type {
      admireToken(tokenId: $tokenId) {
        ... on AdmireTokenPayload {
          __typename
          token {
            definition {
              __typename
              id
              name
            }
            viewerAdmire {
              dbid
              __typename
              creationTime
              admirer {
                id
                dbid
                username
              }
            }

            ...useToggleTokenAdmireFragment
          }
        }
      }
    }
  `);

  const truncatedTokenName = useMemo(() => {
    if (!token.definition.name) {
      return '';
    }
    const name = token.definition.name;
    return name.length > 15 ? name.substring(0, 15) + '...' : name;
  }, [token.definition.name]);

  const [removeAdmire] = usePromisifiedMutation<useToggleTokenAdmireRemoveMutation>(graphql`
    mutation useToggleTokenAdmireRemoveMutation($admireId: DBID!) @raw_response_type {
      removeAdmire(admireId: $admireId) {
        ... on RemoveAdmirePayload {
          __typename
          admireID
        }

        ... on ErrAdmireNotFound {
          __typename
        }
      }
    }
  `);

  const handleRemoveAdmire = useCallback(async () => {
    if (!token.viewerAdmire?.dbid) {
      return;
    }

    trigger('impactLight');

    const errorMetadata: AdditionalContext['tags'] = {
      tokenId: token.dbid,
    };

    const updater: SelectorStoreUpdater<useToggleAdmireRemoveMutation['response']> = (
      store,
      response
    ) => {
      if (
        response?.removeAdmire?.__typename === 'RemoveAdmirePayload' &&
        query.viewer?.__typename === 'Viewer'
      ) {
        // Remove the admire from the store
        if (response.removeAdmire.admireID) {
          const relayId = `Admire:${response.removeAdmire.admireID}`;

          store.delete(relayId);
        }

        // Update the total count of bookmarks displayed in the profile nav tab
        const bookmarksCountConnectionID = ConnectionHandler.getConnectionID(
          `GalleryUser:${query.viewer?.user?.dbid}`,
          'ProfileViewHeaderFragment_bookmarksCount'
        );
        const bookmarksCountStore = store.get(bookmarksCountConnectionID);
        if (bookmarksCountStore) {
          const pageInfo = bookmarksCountStore.getLinkedRecord('pageInfo');
          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) - 1, 'total');
        }
        // Remove the bookmarked token from the bookmarks list displayed on the user profile Bookmarks tab
        const bookmarkedTokensConnectionID = ConnectionHandler.getConnectionID(
          `GalleryUser:${query.viewer?.user?.dbid}`,
          'ProfileViewBookmarksTab_tokensBookmarked'
        );

        const bookmarkedTokensConnection = store.get(bookmarkedTokensConnectionID);
        const tokenRelayId = `Token:${token.dbid}`;
        if (bookmarkedTokensConnection) {
          ConnectionHandler.deleteNode(bookmarkedTokensConnection, tokenRelayId);
        }
      }
    };

    try {
      const response = await removeAdmire({
        updater,
        optimisticUpdater: updater,
        optimisticResponse: {
          removeAdmire: {
            __typename: 'RemoveAdmirePayload',
            admireID: token.viewerAdmire.dbid,
          },
        },
        variables: {
          admireId: token.viewerAdmire.dbid,
        },
      });

      if (
        response.removeAdmire?.__typename !== 'RemoveAdmirePayload' &&
        // We can silently fail if the token was already not admired
        response.removeAdmire?.__typename !== 'ErrAdmireNotFound'
      ) {
        reportError(`Could not unadmire token, typename was ${response.removeAdmire?.__typename}`, {
          tags: errorMetadata,
        });
        return;
      }

      pushToast({
        position: 'top',
        children: (
          <Text>
            <Typography
              className="text-sm text-offBlack dark:text-offWhite"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              Removed{' '}
              <Typography
                className="text-sm text-offBlack dark:text-offWhite"
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                {truncatedTokenName}
              </Typography>{' '}
              from Bookmarks
            </Typography>
          </Text>
        ),
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(`Could not remove admire on token for an unknown reason`, {
          tags: errorMetadata,
        });
      }
    }
  }, [
    token.viewerAdmire?.dbid,
    token.dbid,
    query.viewer,
    removeAdmire,
    pushToast,
    reportError,
    truncatedTokenName,
  ]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleViewBookmarksPress = useCallback(() => {
    if (query.viewer?.__typename === 'Viewer' && query.viewer?.user?.username) {
      navigation.navigate('Profile', {
        username: query.viewer.user.username,
        navigateToTab: 'Bookmarks',
      });
    }
  }, [navigation, query.viewer]);

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      return;
    }

    trigger('impactLight');

    const errorMetadata: AdditionalContext['tags'] = {
      tokenId: token.dbid,
    };

    const updater: SelectorStoreUpdater<useToggleTokenAdmireAddMutation['response']> = (
      store,
      response
    ) => {
      if (
        response?.admireToken?.__typename === 'AdmireTokenPayload' &&
        query.viewer?.__typename === 'Viewer'
      ) {
        // Update the total count of bookmarks displayed in the profile nav tab
        const bookmarksCountConnectionID = ConnectionHandler.getConnectionID(
          `GalleryUser:${query.viewer?.user?.dbid}`,
          'ProfileViewHeaderFragment_bookmarksCount'
        );
        const bookmarksCountStore = store.get(bookmarksCountConnectionID);
        if (bookmarksCountStore) {
          const pageInfo = bookmarksCountStore.getLinkedRecord('pageInfo');
          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) + 1, 'total');
        }
        // Add the bookmarked token to the bookmarks list displayed on the user profile Bookmarks tab

        const bookmarkedTokensConnectionID = ConnectionHandler.getConnectionID(
          `GalleryUser:${query.viewer?.user?.dbid}`,
          'ProfileViewBookmarksTab_tokensBookmarked'
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

    try {
      const optimisticAdmireId = Math.random().toString();
      const response = await admire({
        updater,
        optimisticResponse: {
          admireToken: {
            __typename: 'AdmireTokenPayload',
            token: {
              id: token.id,
              dbid: token.dbid,
              definition: {
                __typename: 'TokenDefinition',
                id: token.definition.id,
                name: token.definition.name,
              },
              viewerAdmire: {
                __typename: 'Admire',
                id: `Admire:${optimisticAdmireId}`,
                dbid: optimisticAdmireId,
                creationTime: new Date().toISOString(),
                admirer: {
                  id: query.viewer?.user?.id ?? 'unknown',
                  dbid: query.viewer?.user?.dbid ?? 'unknown',
                  username: query.viewer?.user?.username ?? null,
                },
              },
            },
          },
        },
        variables: {
          tokenId: token.dbid,
        },
      });

      if (response.admireToken?.__typename !== 'AdmireTokenPayload') {
        reportError(`Could not admire token, typename was ${response.admireToken?.__typename}`, {
          tags: errorMetadata,
        });
        return;
      }

      pushToast({
        position: 'top',
        children: (
          <View className="flex flex-row space-x-2 justify-center items-center max-w-screen">
            <Typography
              className="text-sm text-offBlack dark:text-offWhite"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              Added{' '}
              <Typography
                className="text-sm text-offBlack dark:text-offWhite"
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                {truncatedTokenName}
              </Typography>{' '}
              to Bookmarks
            </Typography>
            <ButtonChip variant="primary" onPress={handleViewBookmarksPress} width="fixed-tight">
              View
            </ButtonChip>
          </View>
        ),
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(`Could not admire on token for an unknown reason`, {
          tags: errorMetadata,
        });
      }
    }
  }, [
    query.viewer?.__typename,
    query.viewer?.user?.dbid,
    query.viewer?.user?.id,
    query.viewer?.user?.username,
    token.dbid,
    token.id,
    token.definition.id,
    token.definition.name,
    admire,
    pushToast,
    handleViewBookmarksPress,
    reportError,
    truncatedTokenName,
  ]);

  const hasViewerAdmiredEvent = Boolean(token.viewerAdmire);

  const toggleTokenAdmire = useCallback(() => {
    if (hasViewerAdmiredEvent) {
      handleRemoveAdmire();
    } else {
      handleAdmire();
    }
  }, [handleAdmire, handleRemoveAdmire, hasViewerAdmiredEvent]);

  return { hasViewerAdmiredEvent, toggleTokenAdmire };
}
