import breakpoints from 'components/core/breakpoints';
import { useEffect } from 'react';
import { graphql, useRefetchableFragment } from 'react-relay';
import styled from 'styled-components';
import { FEED_MAX_WIDTH } from './dimensions';
import GlobalFeed from './GlobalFeed';
import ViewerFeed from './ViewerFeed';
import { FeedViewerFragment$key } from '__generated__/FeedViewerFragment.graphql';
import { VStack } from 'components/core/Spacer/Stack';

export type FeedMode = 'FOLLOWING' | 'WORLDWIDE' | 'USER';

type Props = {
  queryRef: FeedViewerFragment$key;
  setFeedMode: (mode: FeedMode) => void;
  feedMode: FeedMode;
};

export default function Feed({ queryRef, feedMode, setFeedMode }: Props) {
  const [query, refetch] = useRefetchableFragment(
    graphql`
      fragment FeedViewerFragment on Query @refetchable(queryName: "FeedRefreshQuery") {
        ...ViewerFeedFragment
        ...GlobalFeedFragment
      }
    `,
    queryRef
  );

  // refetch when changing modes. this not only displays up-to-date data, but fixes a bug
  // for users logging in from the feed view who were seeing empty ViewerFeeds
  useEffect(() => {
    refetch({}, { fetchPolicy: 'store-and-network' });
  }, [feedMode, refetch]);

  return (
    <StyledFeed>
      {feedMode === 'FOLLOWING' && <ViewerFeed queryRef={query} setFeedMode={setFeedMode} />}
      {feedMode === 'WORLDWIDE' && <GlobalFeed queryRef={query} />}
    </StyledFeed>
  );
}

const StyledFeed = styled(VStack)`
  width: 100vw;
  flex: 1;
  padding-top: 24px;

  @media only screen and ${breakpoints.desktop} {
    width: ${FEED_MAX_WIDTH}px;
  }
`;
