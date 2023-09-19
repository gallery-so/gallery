import { createElement, useCallback, useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { fetchQuery, graphql, useFragment, useRelayEnvironment } from 'react-relay';
import { ErrorIcon } from 'src/icons/ErrorIcon';

import { useTokenStateManagerContext } from '~/contexts/TokenStateManagerContext';
import { TokenFailureBoundaryErrorFallbackFragment$key } from '~/generated/TokenFailureBoundaryErrorFallbackFragment.graphql';
import { TokenFailureBoundaryFragment$key } from '~/generated/TokenFailureBoundaryFragment.graphql';
import { TokenFailureBoundaryLoadingFallbackFragment$key } from '~/generated/TokenFailureBoundaryLoadingFallbackFragment.graphql';
import { TokenFailureBoundaryPollerQuery } from '~/generated/TokenFailureBoundaryPollerQuery.graphql';
import {
  ReportingErrorBoundary,
  ReportingErrorBoundaryProps,
} from '~/shared/errors/ReportingErrorBoundary';

// TODO: use refresh icon instead, and make the token refresh
function TokenPreviewErrorFallback({
  tokenRef,
}: {
  tokenRef: TokenFailureBoundaryErrorFallbackFragment$key;
}) {
  const token = useFragment(
    graphql`
      fragment TokenFailureBoundaryErrorFallbackFragment on Token {
        tokenId
        contract {
          name
        }
      }
    `,
    tokenRef
  );

  return (
    <View className="w-full h-full bg-offWhite dark:bg-black-800 flex items-center justify-center">
      <Text className="text-xs text-metal">{token.contract?.name ?? token.tokenId}</Text>
      <ErrorIcon />
    </View>
  );
}

// TODO: loading for tiny tokens
// TODO: check dark mode
function TokenPreviewLoadingFallback({
  tokenRef,
}: {
  tokenRef: TokenFailureBoundaryLoadingFallbackFragment$key;
}) {
  const token = useFragment(
    graphql`
      fragment TokenFailureBoundaryLoadingFallbackFragment on Token {
        tokenId
        contract {
          name
        }
      }
    `,
    tokenRef
  );

  return (
    <View className="w-full h-full bg-offWhite dark:bg-black-800 flex items-center justify-center">
      <Text className="text-xs text-metal">{token.contract?.name ?? token.tokenId}</Text>
      <Text className="text-xxs text-metal">(processing)</Text>
    </View>
  );
}

type Props = {
  tokenRef: TokenFailureBoundaryFragment$key;
  fallback?: ReportingErrorBoundaryProps['fallback'];
  loadingFallback?: ReportingErrorBoundaryProps['fallback'];
} & Omit<ReportingErrorBoundaryProps, 'fallback'>;

export function TokenFailureBoundary({
  tokenRef,
  fallback: errorFallback,
  loadingFallback: _loadingFallback,
  ...rest
}: Props) {
  const tokenFragment = useFragment(
    graphql`
      fragment TokenFailureBoundaryFragment on Token {
        dbid
        ...TokenFailureBoundaryErrorFallbackFragment
        ...TokenFailureBoundaryLoadingFallbackFragment
      }
    `,
    tokenRef
  );

  const fallback = useMemo(() => {
    return errorFallback || <TokenPreviewErrorFallback tokenRef={tokenFragment} />;
  }, [errorFallback, tokenFragment]);

  const loadingFallback = useMemo(() => {
    return _loadingFallback || <TokenPreviewLoadingFallback tokenRef={tokenFragment} />;
  }, [_loadingFallback, tokenFragment]);

  const { tokens, clearTokenFailureState, markTokenAsPolling, markTokenAsFailed } =
    useTokenStateManagerContext();

  const { dbid: tokenId } = tokenFragment;
  const token = tokens[tokenId];
  const additionalTags = useMemo(() => ({ tokenId }), [tokenId]);

  const relayEnvironment = useRelayEnvironment();

  useEffect(
    function pollTokenWhileStillSyncing() {
      const POLLING_INTERNVAL_MS = 5000;
      let timeoutId: ReturnType<typeof setTimeout>;

      async function reFetchToken() {
        const fetchedToken = await fetchQuery<TokenFailureBoundaryPollerQuery>(
          relayEnvironment,
          graphql`
            query TokenFailureBoundaryPollerQuery($id: DBID!) {
              tokenById(id: $id) {
                ... on Token {
                  media {
                    __typename
                    ... on SyncingMedia {
                      previewURLs {
                        small
                        medium
                        large
                      }
                      fallbackMedia {
                        mediaURL
                      }
                    }
                  }
                  # Ensure relevant polling component gets its data refetched
                  # eslint-disable-next-line relay/must-colocate-fragment-spreads
                  ...getPreviewImageUrlsInlineDangerouslyFragment
                }
              }
            }
          `,
          { id: tokenId }
        ).toPromise();

        const media = fetchedToken?.tokenById?.media;

        if (
          media?.__typename === 'SyncingMedia' &&
          !media?.previewURLs?.small &&
          !media?.previewURLs?.medium &&
          !media?.previewURLs?.large &&
          !media?.fallbackMedia?.mediaURL
        ) {
          // We're still syncing without a fallback, so queue up another refetch
          timeoutId = setTimeout(reFetchToken, POLLING_INTERNVAL_MS);
        } else {
          // If the token was failing before, we need to make sure
          // that it's error state gets cleared on the chance
          // that it just got loaded.
          clearTokenFailureState([tokenId]);
        }
      }

      if (token?.isLoading && !token?.isPolling) {
        reFetchToken();
        markTokenAsPolling(tokenId);
      }

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    },
    [
      clearTokenFailureState,
      markTokenAsPolling,
      relayEnvironment,
      token?.isLoading,
      token?.isPolling,
      tokenId,
    ]
  );

  const handleError = useCallback(
    (error: Error) => {
      markTokenAsFailed(tokenId, error);
    },
    [markTokenAsFailed, tokenId]
  );

  if (token?.isLoading) {
    return <>{loadingFallback}</>;
  }

  if (token?.isFailed) {
    if (typeof fallback === 'function') {
      return createElement(fallback, { error: new Error() });
    } else {
      return <>{fallback}</>;
    }
  }

  return (
    <ReportingErrorBoundary
      key={token?.retryKey ?? 0}
      onError={handleError}
      additionalTags={additionalTags}
      fallback={fallback}
      {...rest}
    />
  );
}
