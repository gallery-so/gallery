import { useEffect, useRef } from 'react';
import { graphql, useRefetchableFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_MODE_KEY } from '~/constants/storageKeys';
import { FeedViewerFragment$key } from '~/generated/FeedViewerFragment.graphql';
import usePersistedState from '~/hooks/usePersistedState';

import FeedModeSelector from './FeedModeSelector';
import GlobalFeed from './GlobalFeed';
import ViewerFeed from './ViewerFeed';

export type FeedMode = 'FOLLOWING' | 'WORLDWIDE' | 'USER';

type Props = {
  queryRef: FeedViewerFragment$key;
};

export default function Feed({ queryRef }: Props) {
  const [query, refetch] = useRefetchableFragment(
    graphql`
      fragment FeedViewerFragment on Query @refetchable(queryName: "FeedRefreshQuery") {
        viewer {
          ... on Viewer {
            __typename
            user {
              dbid
            }
          }
        }
        ...ViewerFeedFragment
        ...GlobalFeedFragment
      }
    `,
    queryRef
  );

  const { viewer } = query;
  const viewerUserId = viewer?.user?.dbid ?? '';
  const defaultFeedMode = viewerUserId ? 'FOLLOWING' : 'WORLDWIDE';
  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const [feedMode, setFeedMode] = usePersistedState<FeedMode>(FEED_MODE_KEY, defaultFeedMode);

  const firstMountRef = useRef(true);
  // refetch when changing modes. this not only displays up-to-date data, but fixes a bug
  // for users logging in from the feed view who were seeing empty ViewerFeeds
  useEffect(() => {
    if (!firstMountRef.current) {
      refetch({}, { fetchPolicy: 'store-and-network' });
    }

    firstMountRef.current = false;
  }, [feedMode, refetch]);

  return (
    <StyledFeed>
      {isLoggedIn && <FeedModeSelector feedMode={feedMode} setFeedMode={setFeedMode} />}
      {feedMode === 'FOLLOWING' && <ViewerFeed queryRef={query} setFeedMode={setFeedMode} />}
      {feedMode === 'WORLDWIDE' && <GlobalFeed queryRef={query} />}
    </StyledFeed>
  );
}

const StyledFeed = styled(VStack)`
  width: 100%;
  flex: 1;

  @media only screen and ${breakpoints.tablet} {
    padding-top: 24px;
  }
`;
