import useWindowSize, { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import styled from 'styled-components';
import EventMedia from './Events/EventMedia';

type Props = {
  tokensToPreview: any;
};
const DEFAULT_DIMENSIONS_DESKTOP = 259.33;
const SMALL_DIMENSIONS_DESKTOP = 190.5;
const MARGIN = 16;

export default function FeedEventTokenPreviews({ tokensToPreview }: Props) {
  const showSmallerPreview = tokensToPreview.length > 3;

  const isMobile = useIsMobileWindowWidth();
  const windowSize = useWindowSize();

  const size = useMemo(() => {
    if (isMobile) {
      if (showSmallerPreview) {
        // If there are 4 previews, size is 25% of vw minus margins
        return (windowSize.width - 5 * MARGIN) / 4;
      }
      // if there are less than 4 previews, size is 33% of vw minus margins (even if there are only 1 or 2 pieces)
      return (windowSize.width - 4 * MARGIN) / 3;
    }
    return showSmallerPreview ? SMALL_DIMENSIONS_DESKTOP : DEFAULT_DIMENSIONS_DESKTOP;
  }, [isMobile, showSmallerPreview, windowSize]);

  return (
    <StyledFeedEventTokenPreviews>
      {tokensToPreview.map((collectionToken) => (
        <EventMedia
          tokenRef={collectionToken}
          key={collectionToken.token.dbid}
          // showSmallerPreview={showSmallerPreview}
          maxWidth={size}
          maxHeight={size}
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
