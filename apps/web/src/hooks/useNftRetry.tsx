import { useCallback, useContext, useMemo, useState } from 'react';
import { Primitive } from 'relay-runtime/lib/store/RelayStoreTypes';

import { defaultTokenErrorState, useNftErrorContext } from '~/contexts/NftErrorContext';
import { ContentIsLoadedEvent, ShimmerActionContext } from '~/contexts/shimmer/ShimmerContext';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { isIosSafari } from '~/utils/browser';

type useNftRetryArgs = {
  tokenId: string;
};

type useNftRetryResult = {
  retryKey: number;
  isFailed: boolean;
  refreshMetadata: () => void;
  refreshingMetadata: boolean;
  handleNftLoaded: ContentIsLoadedEvent;
  handleNftError: (error: Error) => void;
};

export function useNftRetry({ tokenId }: useNftRetryArgs): useNftRetryResult {
  const shimmerContext = useContext(ShimmerActionContext);
  const {
    handleNftError: contextHandleNftError,
    refreshToken,
    markTokenAsLoaded,
    tokens,
  } = useNftErrorContext();

  const handleNftLoaded = useCallback<ContentIsLoadedEvent>(
    (event) => {
      shimmerContext?.setContentIsLoaded(event, tokenId);

      markTokenAsLoaded(tokenId);
    },
    [markTokenAsLoaded, shimmerContext, tokenId]
  );

  const handleNftError = useCallback(
    (error: Error) => {
      // Give up and show the failure state
      shimmerContext?.setContentIsLoaded();

      contextHandleNftError(tokenId, error);
    },
    [contextHandleNftError, shimmerContext, tokenId]
  );

  const refreshMetadata = useCallback(async () => {
    await refreshToken(tokenId);
  }, [refreshToken, tokenId]);

  const { retryKey, isFailed, refreshingMetadata } = useMemo(() => {
    return tokens[tokenId] ?? defaultTokenErrorState();
  }, [tokenId, tokens]);

  return useMemo(() => {
    return {
      retryKey,
      isFailed,
      handleNftError,
      handleNftLoaded,
      refreshMetadata,
      refreshingMetadata,
    };
  }, [isFailed, handleNftLoaded, handleNftError, retryKey, refreshMetadata, refreshingMetadata]);
}

export function useThrowOnMediaFailure(
  componentName: string,
  metadata?: Record<string, Primitive>
) {
  const [hasFailed, setHasFailed] = useState(false);

  const shimmerContext = useContext(ShimmerActionContext);
  const handleError = useCallback(
    (e?: unknown) => {
      shimmerContext?.setContentIsLoaded(e);

      setHasFailed(true);
    },
    [shimmerContext]
  );

  /**
   * there's a widespread issue with certain videos failing to load on iOS;
   * ignore throwing an error and triggering the refresh error boundary
   * if the rendered element is a video and the browser is iOS Safari.
   *
   * ideally we should just always throw an error and have the error boundary
   * decide to continue to render the children instead of the fallback; however,
   * this triggers a re-render, resets the error state, and continuously tries
   * to load the video.
   */
  const shouldIgnoreError = componentName === 'NftDetailVideo' && isIosSafari();

  if (hasFailed && !shouldIgnoreError) {
    throw new CouldNotRenderNftError(componentName, 'Could not load media', metadata);
  }

  return useMemo(() => ({ handleError }), [handleError]);
}
