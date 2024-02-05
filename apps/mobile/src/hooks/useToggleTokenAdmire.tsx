import { useCallback } from 'react';
import { Text } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';
import { useToggleAdmireRemoveMutation } from '~/generated/useToggleAdmireRemoveMutation.graphql';
import { useToggleTokenAdmireAddMutation } from '~/generated/useToggleTokenAdmireAddMutation.graphql';
import { useToggleTokenAdmireFragment$key } from '~/generated/useToggleTokenAdmireFragment.graphql';
import { useToggleTokenAdmireQueryFragment$key } from '~/generated/useToggleTokenAdmireQueryFragment.graphql';
import { useToggleTokenAdmireRemoveMutation } from '~/generated/useToggleTokenAdmireRemoveMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

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
      if (response?.removeAdmire?.__typename === 'RemoveAdmirePayload') {
        if (response.removeAdmire.admireID) {
          const relayId = `Admire:${response.removeAdmire.admireID}`;

          store.delete(relayId);
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
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(`Could not remove admire on token for an unknown reason`, {
          tags: errorMetadata,
        });
      }
    }
  }, [reportError, removeAdmire, token.viewerAdmire?.dbid, token.dbid]);

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      return;
    }

    trigger('impactLight');

    const errorMetadata: AdditionalContext['tags'] = {
      tokenId: token.dbid,
    };

    try {
      const optimisticAdmireId = Math.random().toString();
      const response = await admire({
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
          <Text>
            <Typography
              className="text-sm text-offBlack dark:text-offWhite"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              Added{' '}
              <Typography
                className="text-sm text-offBlack dark:text-offWhite"
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                {response.admireToken.token?.definition.name}
              </Typography>{' '}
              to Bookmarks
            </Typography>
          </Text>
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
    admire,
    token.dbid,
    token.id,
    pushToast,
    query.viewer,
    reportError,
    token.definition.id,
    token.definition.name,
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
