import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeedEventTokenPreviewsFragment$key } from '~/generated/FeedEventTokenPreviewsFragment.graphql';
import { FeedEventTokenPreviewsQueryFragment$key } from '~/generated/FeedEventTokenPreviewsQueryFragment.graphql';
import useWindowSize, { useBreakpoint } from '~/hooks/useWindowSize';

import { FEED_EVENT_TOKEN_MARGIN, getFeedTokenDimensions, NumTokens } from './dimensions';
import EventMedia from './Events/EventMedia';

type Props = {
  tokenToPreviewRefs: FeedEventTokenPreviewsFragment$key;
  queryRef: FeedEventTokenPreviewsQueryFragment$key;
  isInCaption: boolean;
};

export default function FeedEventTokenPreviews({
  tokenToPreviewRefs,
  queryRef,
  isInCaption,
}: Props) {
  const tokensToPreview = useFragment(
    graphql`
      fragment FeedEventTokenPreviewsFragment on CollectionToken @relay(plural: true) {
        token {
          dbid
        }
        ...EventMediaFragment
      }
    `,
    tokenToPreviewRefs
  );

  const query = useFragment(
    graphql`
      fragment FeedEventTokenPreviewsQueryFragment on Query {
        ...EventMediaQueryFragment
      }
    `,
    queryRef
  );

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
          queryRef={query}
          key={collectionToken.token?.dbid}
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
