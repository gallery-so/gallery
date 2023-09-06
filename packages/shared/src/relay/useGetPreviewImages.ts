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

type useGetSinglePreviewImageProps = {
  tokenRef: useGetPreviewImagesSingleFragment$key;
  preferStillFrameFromGif?: boolean;
  size: 'small' | 'medium' | 'large';
};

/**
 * Convenience feature on top of below method, `useGetPreviewImagesWithPolling`.
 * Client can simply pass in the token and the size they want.
 */
export function useGetSinglePreviewImage({
  tokenRef,
  preferStillFrameFromGif = false,
  size,
}: useGetSinglePreviewImageProps): string | null {
  const token = useFragment(
    graphql`
      fragment useGetPreviewImagesSingleFragment on Token {
        ...useGetPreviewImagesWithPollingFragment
      }
    `,
    tokenRef
  );

  const result = useGetPreviewImagesWithPolling({ tokenRef: token, preferStillFrameFromGif });

  if (result.type === 'valid') {
    return result.urls[size];
  }

  return null;
}

type useGetPreviewImagesWithPolling = {
  tokenRef: useGetPreviewImagesWithPollingFragment$key;
  preferStillFrameFromGif?: boolean;
};

/**
 * Features:
 * 1) Returns a set of preview *image* URLs regardless of the underlying asset type
 * 2) Returns fallbacks for invalid or syncing media
 * 3) Polls SyncingMedia types until it's resolved
 */
export function useGetPreviewImagesWithPolling({
  tokenRef,
  preferStillFrameFromGif = false,
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

  if (result.type === 'error') {
    reportError(result.error);
  }

  useEffect(() => {
    if (result.type === 'isSyncingWithoutFallback') {
      // TODO: poll
    }
  }, [result]);

  return result;
}
