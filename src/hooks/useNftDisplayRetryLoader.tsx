import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  ContentIsLoadedEvent,
  ShimmerActionContext,
  useSetContentIsLoaded,
} from 'contexts/shimmer/ShimmerContext';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { graphql } from 'relay-runtime';
import { useNftDisplayRetryLoaderMutation } from '../../__generated__/useNftDisplayRetryLoaderMutation.graphql';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';

type useNftDisplayRetryLoaderArgs = {
  tokenId: string;
};

type useNftDisplayRetryLoaderResult = {
  isFailed: boolean;
  handleNftLoaded: ContentIsLoadedEvent;
  handleNftError: ContentIsLoadedEvent;
  retryKey: number;
  refreshMetadata: () => void;
  refreshingMetadata: boolean;
};

export function useNftDisplayRetryLoader({
  tokenId,
}: useNftDisplayRetryLoaderArgs): useNftDisplayRetryLoaderResult {
  const reportError = useReportError();
  const { pushToast } = useToastActions();

  const [retryKey, setRetryKey] = useState(0);
  const [refreshed, setRefreshed] = useState(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [refreshingMetadata, setRefreshingMetadata] = useState(false);

  const shimmerContext = useContext(ShimmerActionContext);

  const handleNftLoaded = useCallback(
    (event?: any) => {
      shimmerContext?.setContentIsLoaded(event);

      // If we "successfully" loaded, we never
      // want to show the failure state
      setIsFailed(false);
    },
    [shimmerContext]
  );

  const handleNftError = useCallback(
    (event?: any) => {
      // Give up and show the failure state
      shimmerContext?.setContentIsLoaded(event);
      setIsFailed(true);

      // If the user refreshed the metadata and there was another failure,
      // we'll show them a new toast telling them things failed to load,
      // and we're looking into the issue asap.
      if (refreshed) {
        pushToast({
          message:
            'This piece has failed to load. This issue has been reported to the Gallery team.',
          autoClose: true,
        });
      }

      reportError('Could not load nft after 3 retries', {
        tags: { tokenId, alreadyRefreshed: refreshed },
      });
    },
    [pushToast, refreshed, reportError, shimmerContext, tokenId]
  );

  const retry = useCallback(() => {
    setIsFailed(false);
    setRefreshed(true);
    setRetryKey((previous) => previous + 1);
  }, []);

  const [refresh] = usePromisifiedMutation<useNftDisplayRetryLoaderMutation>(graphql`
    mutation useNftDisplayRetryLoaderMutation($tokenId: DBID!) {
      refreshToken(tokenId: $tokenId) {
        ... on RefreshTokenPayload {
          __typename
          token {
            # Ensure we're reloading the necessary data
            ...NftPreviewTokenFragment
          }
        }
      }
    }
  `);

  const refreshMetadata = useCallback(async () => {
    function pushErrorToast() {
      pushToast({
        message:
          'There was an error while refreshing your piece. We have been notified and are looking into it.',
        autoClose: true,
      });
    }

    pushToast({
      message: 'This piece is loading. This may take up to a few minutes.',
      autoClose: true,
    });

    try {
      setRefreshingMetadata(true);
      const response = await refresh({ variables: { tokenId } });

      if (response.refreshToken?.__typename === 'RefreshTokenPayload') {
        retry();
      } else {
        pushErrorToast();
        reportError('GraphQL Error while refreshing nft metadata', {
          tags: { tokenId, typename: response.refreshToken?.__typename },
        });
      }
    } catch (e) {
      reportError('GraphQL Error while refreshing nft metadata', { tags: { tokenId } });
      pushErrorToast();
    } finally {
      setRefreshingMetadata(false);
    }
  }, [pushToast, refresh, reportError, retry, tokenId]);

  return useMemo(() => {
    return {
      handleNftLoaded,
      handleNftError,
      retryKey,
      isFailed,
      refreshMetadata,
      refreshingMetadata: refreshingMetadata,
    };
  }, [isFailed, handleNftError, handleNftLoaded, refreshMetadata, retryKey, refreshingMetadata]);
}
