import ActionText from 'components/core/ActionText/ActionText';
import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import { fadeIn } from 'components/core/keyframes';
import transitions from 'components/core/transitions';
import { FADE_TRANSITION_TIME_MS } from 'components/FadeTransitioner/FadeTransitioner';
import NavbarGLink from 'components/NavbarGLink';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { FEED_MODE_KEY } from 'constants/storageKeys';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback, useEffect } from 'react';
import { graphql, useRefetchableFragment } from 'react-relay';
import styled from 'styled-components';
import { FEED_MAX_WIDTH } from './dimensions';
import GlobalFeed from './GlobalFeed';
import ViewerFeed from './ViewerFeed';
import { FeedViewerFragment$key } from '__generated__/FeedViewerFragment.graphql';
import { HStack, VStack } from 'components/core/Spacer/Stack';

export type FeedMode = 'FOLLOWING' | 'WORLDWIDE' | 'USER';

type ControlProps = {
  setFeedMode: (mode: FeedMode) => void;
  feedMode: FeedMode;
};

function FeedNavbarControl({ setFeedMode, feedMode }: ControlProps) {
  const track = useTrack();
  const handleFollowingModeClick = useCallback(() => {
    track('Feed: Clicked toggle to Following feed');
    setFeedMode('FOLLOWING');
  }, [setFeedMode, track]);

  const handleWorldwideModeClick = useCallback(() => {
    track('Feed: Clicked toggle to Worldwide feed');
    setFeedMode('WORLDWIDE');
  }, [setFeedMode, track]);

  return (
    <StyledFeedNavbarControl justify="center" align="center" gap={10}>
      <StyledTextWrapperLeft>
        <StyledNavControlText onClick={handleFollowingModeClick} focused={feedMode === 'FOLLOWING'}>
          Following
        </StyledNavControlText>
      </StyledTextWrapperLeft>
      <NavbarGLink />
      <StyledTextWrapper>
        <StyledNavControlText onClick={handleWorldwideModeClick} focused={feedMode === 'WORLDWIDE'}>
          Worldwide
        </StyledNavControlText>
      </StyledTextWrapper>
    </StyledFeedNavbarControl>
  );
}

const StyledNavControlText = styled(ActionText)<{ focused: boolean }>`
  animation: ${fadeIn} ${transitions.cubic} 700ms 1 forwards;
  color: ${({ focused }) => (focused ? colors.offBlack : colors.metal)};

  opacity: 0;
`;

const StyledTextWrapper = styled.div`
  display: flex;
  flex: 1;
`;

const StyledTextWrapperLeft = styled(StyledTextWrapper)`
  justify-content: flex-end;
`;

const StyledFeedNavbarControl = styled(HStack)`
  width: 100%;
`;

type Props = {
  queryRef: FeedViewerFragment$key;
};

export default function Feed({ queryRef }: Props) {
  const [query, refetch] = useRefetchableFragment(
    graphql`
      fragment FeedViewerFragment on Query @refetchable(queryName: "FeedRefreshQuery") {
        viewer {
          ... on Viewer {
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

  const [feedMode, setFeedMode] = usePersistedState<FeedMode>(FEED_MODE_KEY, defaultFeedMode);

  // refetch when changing modes. this not only displays up-to-date data, but fixes a bug
  // for users logging in from the feed view who were seeing empty ViewerFeeds
  useEffect(() => {
    refetch({}, { fetchPolicy: 'store-and-network' });
  }, [feedMode, refetch]);

  const { setCustomNavCenterContent } = useGlobalLayoutActions();

  // This effect ensures the Feed controls on the navbar are removed when the Feed unmounts, so that it is not visible when navigating to a different page.
  useEffect(() => {
    return () => {
      setTimeout(() => {
        setCustomNavCenterContent(null);
      }, FADE_TRANSITION_TIME_MS);
    };
  }, [setCustomNavCenterContent]);

  // This effect handles adding and removing the Feed controls on the navbar when mounting this component, and signing in+out while on the Feed page.
  useEffect(() => {
    if (!viewerUserId) {
      setFeedMode('WORLDWIDE');
      setCustomNavCenterContent(null);
    } else {
      setCustomNavCenterContent(
        <FeedNavbarControl setFeedMode={setFeedMode} feedMode={feedMode} />
      );
    }
  }, [setCustomNavCenterContent, viewerUserId, feedMode, setFeedMode]);

  return (
    <StyledFeed>
      {viewerUserId && feedMode === 'FOLLOWING' && (
        <ViewerFeed queryRef={query} setFeedMode={setFeedMode} />
      )}
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
