import { useMemo } from 'react';
import styled from 'styled-components';

import { EventMediaFragment$key } from '~/generated/EventMediaFragment.graphql';
import useWindowSize, { useBreakpoint } from '~/hooks/useWindowSize';

import { FEED_EVENT_TOKEN_MARGIN, getFeedTokenDimensions, NumTokens } from './dimensions';
import EventMedia from './Events/EventMedia';

export type TokenToPreview = EventMediaFragment$key & {
  token: { dbid: string };
};

type Props = {
  tokensToPreview: TokenToPreview[];
  isInCaption: boolean;
};

export default function FeedEventTokenPreviews({ tokensToPreview, isInCaption }: Props) {
  const breakpoint = useBreakpoint();
  const { width } = useWindowSize();

  const sizePx = useMemo(() => {
    return getFeedTokenDimensions({
      numTokens: `${tokensToPreview.length}` as NumTokens,
      maxWidth: width,
      breakpoint,
      isInCaption,
    });
  }, [breakpoint, isInCaption, tokensToPreview.length, width]);

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
