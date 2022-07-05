import { size } from 'components/core/breakpoints';
import useWindowSize, {
  useBreakpoint,
  useIsMobileOrMobileLargeWindowWidth,
} from 'hooks/useWindowSize';
import { useMemo } from 'react';
import styled from 'styled-components';
import { EventMediaFragment$key } from '__generated__/EventMediaFragment.graphql';
import EventMedia from './Events/EventMedia';

export type TokenToPreview = EventMediaFragment$key & {
  token: { dbid: string };
};

type Props = {
  tokensToPreview: TokenToPreview[];
};

export const DEFAULT_DIMENSIONS_DESKTOP = 259.33;
export const SMALL_DIMENSIONS_DESKTOP = 190.5;
export const FEED_EVENT_TOKEN_MARGIN = 16;

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
      if (showSmallerPreview) {
        // If there are 4 previews, size is 25% of vw minus margins
        return (size.tablet - 3 * FEED_EVENT_TOKEN_MARGIN) / 4;
      }
      // if there are less than 4 previews, size is 33% of vw minus margins (even if there are only 1 or 2 pieces)
      return (size.tablet - 2 * FEED_EVENT_TOKEN_MARGIN) / 3;
    }
    return showSmallerPreview ? SMALL_DIMENSIONS_DESKTOP : DEFAULT_DIMENSIONS_DESKTOP;
  }, [breakpoint, isMobile, showSmallerPreview, windowSize.width]);

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
  gap: 16px;
  justify-content: center;
  align-items: center;
`;
