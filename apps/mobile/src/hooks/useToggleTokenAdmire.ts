import { useCallback } from 'react';
import { trigger } from 'react-native-haptic-feedback';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

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

        viewerAdmire {
          id
          dbid
        }
      }
    `,
    tokenRef
  );

  const reportError = useReportError();

  const [admire] = usePromisifiedMutation<useToggleTokenAdmireAddMutation>(graphql`
    mutation useToggleTokenAdmireAddMutation($tokenId: DBID!, $connections: [ID!]!)
    @raw_response_type {
      admireToken(tokenId: $tokenId) {
        ... on AdmireTokenPayload {
          __typename
          token {
            viewerAdmire @appendNode(edgeTypeName: "TokenAdmireEdge", connections: $connections) {
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

  const interactionsConnection = ConnectionHandler.getConnectionID(
    token.id,
    'Interactions_token_admires'
  );

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
        const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

        pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) - 1, 'total');

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
  }, [reportError, removeAdmire, interactionsConnection, token.viewerAdmire?.dbid, token.dbid]);

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
      if (response?.admireToken?.__typename === 'AdmireTokenPayload') {
        const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

        pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
      }
    };

    try {
      const optimisticAdmireId = Math.random().toString();
      const response = await admire({
        updater,
        optimisticUpdater: updater,
        optimisticResponse: {
          admireToken: {
            __typename: 'AdmireTokenPayload',
            token: {
              id: token.id,
              dbid: token.dbid,
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
          connections: [interactionsConnection],
        },
      });

      if (response.admireToken?.__typename !== 'AdmireTokenPayload') {
        reportError(`Could not admire token, typename was ${response.admireToken?.__typename}`, {
          tags: errorMetadata,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(`Could not admire on token for an unknown reason`, {
          tags: errorMetadata,
        });
      }
    }
  }, [admire, token.dbid, token.id, interactionsConnection, query.viewer, reportError]);

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
