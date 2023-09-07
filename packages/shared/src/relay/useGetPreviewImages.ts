import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useGetPreviewImagesSingleFragment$key } from '~/generated/useGetPreviewImagesSingleFragment.graphql';
import { useGetPreviewImagesWithPollingFragment$key } from '~/generated/useGetPreviewImagesWithPollingFragment.graphql';

import { useReportError } from '../contexts/ErrorReportingContext';
import {
  getPreviewImageUrlsInlineDangerously,
  GetPreviewImageUrlsResult,
} from './getPreviewImageUrlsInlineDangerously';

type SharedProps = {
  preferStillFrameFromGif?: boolean;
  /**
   * `shouldThrow` determines whether the underlying error is explicitly thrown or quietly reported.
   * this param should typically be set to `true`, and somewhere above where the hook is used a proper
   * error boundary should be set up to catch + report it. in web, the boundary is expected to be
   * `NftFailureBoundary`, while in mobile it'll be `ReportingErrorBoundary`.
   */
  shouldThrow?: boolean;
};

type useGetSinglePreviewImageProps = {
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
  shouldThrow = false,
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
  // explicitly throw the error...
  if (result.type === 'error' && shouldThrow) {
    throw result.error;
  }
  useEffect(() => {
    // ...or quietly report the error
    if (result.type === 'error' && !shouldThrow) {
      reportError(result.error);
    }
  }, [reportError, result, shouldThrow]);

  useEffect(() => {
    if (result.type === 'isSyncingWithoutFallback') {
      // TODO: trigger polling from shared context
    }
  }, [result]);

  return result;
}
