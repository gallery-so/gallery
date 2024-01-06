import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useContainedDimensionsForTokenFragment$key } from '~/generated/useContainedDimensionsForTokenFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import {
  DESKTOP_TOKEN_DETAIL_VIEW_SIZE,
  fitDimensionsToContainerContain,
  MOBILE_TOKEN_DETAIL_VIEW_SIZE,
} from '~/shared/utils/fitDimensionsToContainer';

type useContainedDimensionsForTokenArgs = {
  mediaRef: useContainedDimensionsForTokenFragment$key;
  tokenSize?: number;
};

export function useContainedDimensionsForToken({
  mediaRef,
  tokenSize,
}: useContainedDimensionsForTokenArgs) {
  const media = useFragment(
    graphql`
      fragment useContainedDimensionsForTokenFragment on Media {
        dimensions {
          width
          height
        }
      }
    `,
    mediaRef
  );

  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();
  const width = media.dimensions?.width;
  const height = media.dimensions?.height;

  return useMemo(() => {
    const TOKEN_SIZE = tokenSize
      ? tokenSize
      : isMobileOrMobileLarge
      ? MOBILE_TOKEN_DETAIL_VIEW_SIZE
      : DESKTOP_TOKEN_DETAIL_VIEW_SIZE;

    if (width && height) {
      return fitDimensionsToContainerContain({
        container: { width: TOKEN_SIZE, height: TOKEN_SIZE },
        source: {
          width,
          height,
        },
      });
    }

    return {
      height: TOKEN_SIZE,
      width: TOKEN_SIZE,
    };
  }, [isMobileOrMobileLarge, width, height, tokenSize]);
}
