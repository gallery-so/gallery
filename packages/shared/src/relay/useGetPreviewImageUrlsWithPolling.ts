import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useReportError } from '~/contexts/ErrorReportingContext';
// import { useGetPreviewImageUrlsFragment$key } from '~/generated/useGetPreviewImageUrlsFragment.graphql';
import { useGetPreviewImageUrlsWithPollingFragment$key } from '~/generated/useGetPreviewImageUrlsWithPollingFragment.graphql';

import {
  getPreviewImageUrlsInlineDangerously,
  GetPreviewImageUrlsResult,
} from './getPreviewImageUrlsInlineDangerously';

type Props = {
  tokenRef: useGetPreviewImageUrlsWithPollingFragment$key;
  preferStillFrameFromGif?: boolean;
};

/**
 * Features:
 * 1) Returns a set of preview *image* URLs regardless of the underlying asset type
 * 2) Returns fallbacks for invalid or syncing media
 * 3) Polls SyncingMedia types until it's resolved
 */
export function useGetPreviewImageUrlsWithPolling({
  tokenRef,
  preferStillFrameFromGif = false,
}: Props): GetPreviewImageUrlsResult {
  const token = useFragment(
    graphql`
      fragment useGetPreviewImageUrlsWithPollingFragment on Token {
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
