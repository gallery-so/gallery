import { createElement, useEffect, useMemo } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';
import styled from 'styled-components';

import { useNftErrorContext } from '~/contexts/NftErrorContext';
import { NftFailureBoundaryPollerQuery } from '~/generated/NftFailureBoundaryPollerQuery.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import {
  ReportingErrorBoundary,
  ReportingErrorBoundaryProps,
} from '~/shared/errors/ReportingErrorBoundary';
import colors from '~/shared/theme/colors';

import { VStack } from '../core/Spacer/Stack';
import {
  NftFailureFallback,
  NftFailureFallbackProps,
  NftFallbackLabel,
} from './NftFailureFallback';

type Props = {
  tokenId: string;
  fallbackSize?: NftFailureFallbackProps['size'];
  fallback?: ReportingErrorBoundaryProps['fallback'];
  loadingFallback?: ReportingErrorBoundaryProps['fallback'];
} & Omit<ReportingErrorBoundaryProps, 'fallback'>;

export function NftFailureBoundary({
  tokenId,
  fallbackSize = 'medium',
  fallback = <NftFailureFallback tokenId={tokenId} size={fallbackSize} />,
  loadingFallback = <NftLoadingFallback size={fallbackSize} />,
  ...rest
}: Props) {
  const { handleNftError, retryKey } = useNftRetry({
    tokenId,
  });

  const { tokens, clearTokenFailureState, markTokenAsPolling } = useNftErrorContext();

  const additionalTags = useMemo(() => ({ tokenId }), [tokenId]);

  const token = tokens[tokenId];

  const relayEnvironment = useRelayEnvironment();

  useEffect(
    function pollTokenWhileStillSyncing() {
      const POLLING_INTERVAL_MS = 5000;
      let timeoutId: ReturnType<typeof setTimeout>;

      async function reFetchToken() {
        const fetchedToken = await fetchQuery<NftFailureBoundaryPollerQuery>(
          relayEnvironment,
          graphql`
            query NftFailureBoundaryPollerQuery($id: DBID!) {
              tokenById(id: $id) {
                ... on Token {
                  definition {
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

        const media = fetchedToken?.tokenById?.definition?.media;

        if (
          media?.__typename === 'SyncingMedia' &&
          !media?.previewURLs?.small &&
          !media?.previewURLs?.medium &&
          !media?.previewURLs?.large &&
          !media?.fallbackMedia?.mediaURL
        ) {
          // We're still syncing without a fallback, so queue up another refetch
          timeoutId = setTimeout(reFetchToken, POLLING_INTERVAL_MS);
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
      key={retryKey}
      onError={handleNftError}
      additionalTags={additionalTags}
      fallback={<NftFailureFallback tokenId={tokenId} />}
      {...rest}
    />
  );
}

type NftLoadingFallbackProps = {
  size?: 'tiny' | 'medium';
};

export function NftLoadingFallback({ size = 'medium' }: NftLoadingFallbackProps) {
  return (
    <Container justify="center" align="center">
      <NftFallbackLabel size={size}>Loading...</NftFallbackLabel>
    </Container>
  );
}

const Container = styled(VStack)`
  width: 100%;
  height: 100%;

  background-color: ${colors.offWhite};
`;
