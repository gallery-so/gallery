import { useMemo } from 'react';
import styled from 'styled-components';

import { size } from '~/components/core/breakpoints';
import { EventMediaFragment$key } from '~/generated/EventMediaFragment.graphql';
import useWindowSize, {
  useBreakpoint,
  useIsMobileOrMobileLargeWindowWidth,
} from '~/hooks/useWindowSize';

import { DIMENSIONS, FEED_EVENT_TOKEN_MARGIN, FEED_MAX_WIDTH } from './dimensions';
import EventMedia from './Events/EventMedia';

export type TokenToPreview = EventMediaFragment$key & {
  token: { dbid: string };
};

type Props = {
  tokensToPreview: TokenToPreview[];
};

export default function FeedEventTokenPreviews({ tokensToPreview }: Props) {
  const showSmallerPreview = tokensToPreview.length > 3;

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const windowSize = useWindowSize();

  const breakpoint = useBreakpoint();

  const sizePx = useMemo(() => {
    if (isMobile) {
      if (showSmallerPreview) {
        // If there are 4 previews, size is 25% of vw minus margins
        return (windowSize.width - 5 * FEED_EVENT_TOKEN_MARGIN) / 4;
      }
      // if there are less than 4 previews, size is 33% of vw minus margins (even if there are only 1 or 2 pieces)
      return (windowSize.width - 4 * FEED_EVENT_TOKEN_MARGIN) / 3;
    }
    if (breakpoint === size.tablet) {
      return DIMENSIONS.TABLET[`${tokensToPreview.length}`];
    }

    return DIMENSIONS.DESKTOP[`${tokensToPreview.length}`];
  }, [breakpoint, isMobile, showSmallerPreview, tokensToPreview.length, windowSize.width]);

  return (
    <StyledFeedEventTokenPreviews>
      {tokensToPreview.map((collectionToken) => (
        <EventMedia
          tokenRef={collectionToken}
          key={collectionToken.token.dbid}
          maxWidth={sizePx}
          maxHeight={sizePx}
        />
      ))}
    </StyledFeedEventTokenPreviews>
  );
}

const StyledFeedEventTokenPreviews = styled.div`
  display: flex;
  gap: ${FEED_EVENT_TOKEN_MARGIN}px;
  justify-content: center;
  align-items: center;
`;
