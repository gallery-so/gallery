import { createElement, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
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

type FallbackProps = {
  fallbackAspectSquare?: boolean;
  variant?: 'tiny' | 'small' | 'medium' | 'large';
};

function FallbackWrapper({ children, fallbackAspectSquare }: PropsWithChildren<FallbackProps>) {
  const inner = useMemo(
    () => (
      <View className="w-full h-full bg-porcelain dark:bg-black-800 flex items-center justify-center text-center truncate p-1">
        {children}
      </View>
    ),
    [children]
  );

  if (fallbackAspectSquare) {
    return <View className="aspect-square">{inner}</View>;
  }

  return inner;
}

function variantToTextSize(variant: FallbackProps['variant'] = 'tiny') {
  return {
    tiny: 'xs',
    small: 'xs',
    medium: 'sm',
    large: 'base',
  }[variant];
}

function variantToSubtextSize(variant: FallbackProps['variant'] = 'tiny') {
  return {
    tiny: 'xxs',
    small: 'xxs',
    medium: 'xs',
    large: 'xs',
  }[variant];
}

// TODO v soon:
// - use refresh icon instead, and fetch new asset
// - responsiveness for tiny and large versions
// - check dark mode
// - truncate / ellipses text
function TokenPreviewErrorFallback({
  tokenRef,
  variant,
}: // fallbackAspectSquare,
// variant,
{
  tokenRef: TokenFailureBoundaryErrorFallbackFragment$key;
} & FallbackProps) {
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
    <>
      <Text
        className={`text-${variantToTextSize(variant)} text-metal text-center`}
        numberOfLines={2}
      >
        {token.contract?.name ?? token.tokenId}
      </Text>
      {variant === 'tiny' ? null : (
        <View className="p-1">
          <ErrorIcon />
        </View>
      )}
    </>
  );
}

// TODO v soon:
// - responsiveness for tiny and large versions
// - check dark mode
// - truncate / ellipses text
function TokenPreviewLoadingFallback({
  tokenRef,
  variant,
}: {
  tokenRef: TokenFailureBoundaryLoadingFallbackFragment$key;
} & FallbackProps) {
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
    <>
      <Text
        className={`text-${variantToTextSize(variant)} text-metal text-center`}
        numberOfLines={2}
      >
        {token.contract?.name ?? token.tokenId}
      </Text>
      {variant === 'tiny' ? null : (
        <Text className={`text-${variantToSubtextSize(variant)} text-metal`}>(processing)</Text>
      )}
    </>
  );
}

type Props = {
  tokenRef: TokenFailureBoundaryFragment$key;
  fallback?: ReportingErrorBoundaryProps['fallback'];
  loadingFallback?: ReportingErrorBoundaryProps['fallback'];
} & Omit<ReportingErrorBoundaryProps, 'fallback'> &
  FallbackProps;

export function TokenFailureBoundary({
  tokenRef,
  fallback: errorFallback,
  loadingFallback: _loadingFallback,
  fallbackAspectSquare = true,
  variant = 'medium',
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
    return (
      errorFallback || (
        <FallbackWrapper fallbackAspectSquare={fallbackAspectSquare} variant={variant}>
          <TokenPreviewErrorFallback
            tokenRef={tokenFragment}
            fallbackAspectSquare={fallbackAspectSquare}
            variant={variant}
          />
        </FallbackWrapper>
      )
    );
  }, [errorFallback, fallbackAspectSquare, tokenFragment, variant]);

  const loadingFallback = useMemo(() => {
    return (
      _loadingFallback || (
        <FallbackWrapper fallbackAspectSquare={fallbackAspectSquare} variant={variant}>
          <TokenPreviewLoadingFallback
            tokenRef={tokenFragment}
            fallbackAspectSquare={fallbackAspectSquare}
            variant={variant}
          />
        </FallbackWrapper>
      )
    );
  }, [_loadingFallback, fallbackAspectSquare, tokenFragment, variant]);

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
