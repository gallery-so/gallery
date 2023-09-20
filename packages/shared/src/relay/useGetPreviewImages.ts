import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useGetPreviewImagesSingleFragment$key } from '~/generated/useGetPreviewImagesSingleFragment.graphql';
import { useGetPreviewImagesWithPollingFragment$key } from '~/generated/useGetPreviewImagesWithPollingFragment.graphql';

import { useReportError } from '../contexts/ErrorReportingContext';
import { StillLoadingNftError } from '../errors/StillLoadingNftError';
import {
  getPreviewImageUrlsInlineDangerously,
  GetPreviewImageUrlsResult,
  SyncingMediaWithoutFallback,
} from './getPreviewImageUrlsInlineDangerously';

type SharedProps = {
  preferStillFrameFromGif?: boolean;
  /**
   * `shouldThrow` will cause the hook to explicitly throw an error OR loading state to be caught by
   * a nearby boundary (`NftFailureBoundary` in web, `ReportingErrorBoundary` in mobile).
   *
   * otherwise, any errors will be quietly reported without throwing.
   */
  shouldThrow?: boolean;
};

export type useGetSinglePreviewImageProps = {
  tokenRef: useGetPreviewImagesSingleFragment$key;
  size: 'small' | 'medium' | 'large';
} & SharedProps;

/**
 * Convenience feature on top of below method, `useGetPreviewImagesWithPolling`.
 * Client can simply pass in the token and the size they want.
 */
export function useGetSinglePreviewImage({
  tokenRef,
  size,
  ...rest
}: useGetSinglePreviewImageProps): string | null {
  const token = useFragment(
    graphql`
      fragment useGetPreviewImagesSingleFragment on Token {
        ...useGetPreviewImagesWithPollingFragment
      }
    `,
    tokenRef
  );

  const result = useGetPreviewImagesWithPolling({
    tokenRef: token,
    ...rest,
  });

  if (result.type === 'valid') {
    return result.urls[size];
  }

  return null;
}

type useGetPreviewImagesWithPolling = {
  tokenRef: useGetPreviewImagesWithPollingFragment$key;
} & SharedProps;

/**
 * Features:
 * 1) Returns a set of preview *image* URLs regardless of the underlying asset type
 * 2) Returns fallbacks for invalid or syncing media
 * 3) Polls SyncingMedia types until it's resolved
 */
export function useGetPreviewImagesWithPolling({
  tokenRef,
  preferStillFrameFromGif = false,
  shouldThrow = true,
}: useGetPreviewImagesWithPolling): GetPreviewImageUrlsResult {
  const token = useFragment(
    graphql`
      fragment useGetPreviewImagesWithPollingFragment on Token {
        ...getPreviewImageUrlsInlineDangerouslyFragment
      }
    `,
    tokenRef
  );

  const result = getPreviewImageUrlsInlineDangerously({ tokenRef: token, preferStillFrameFromGif });

  const reportError = useReportError();
  // explicitly throw the loading state. this will allow a boundary
  // to catch it and display a loader.
  if (shouldThrow && result.type === SyncingMediaWithoutFallback) {
    throw new StillLoadingNftError('token is syncing without a fallback');
  }
  if (shouldThrow && result.type === 'error') {
    throw result.error;
  }
  useEffect(
    function silentlyReportError() {
      // quietly report the error if we opt out of throwing it
      if (!shouldThrow && result.type === 'error') {
        reportError(result.error);
      }
    },
    [reportError, result, shouldThrow]
  );

  return result;
}
