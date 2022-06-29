import ActionText from 'components/core/ActionText/ActionText';
import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import { fadeIn } from 'components/core/keyframes';
import Spacer from 'components/core/Spacer/Spacer';
import transitions from 'components/core/transitions';
import NavbarGLink from 'components/NavbarGLink';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useCallback, useEffect, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import { FeedViewerQuery } from '__generated__/FeedViewerQuery.graphql';
import GlobalFeed from './GlobalFeed';
import ViewerFeed from './ViewerFeed';

export const FOLLOWING = Symbol('FOLLOWING');
export const WORLDWIDE = Symbol('WORLDWIDE');
export type FeedMode = typeof FOLLOWING | typeof WORLDWIDE;

type ControlProps = {
  setFeedMode: (mode: FeedMode) => void;
  initialFeedMode: FeedMode;
};

function FeedNavbarControl({ setFeedMode, initialFeedMode }: ControlProps) {
  // Internally mirror the feed mode state so that we can avoid adding it to the dep array, and avoid re-adding these controls to the navbar when the user switches from Following to Worldwide feed
  const [feedModeCopy, setFeedModeCopy] = useState<FeedMode>(initialFeedMode);

  const handleFollowingModeClick = useCallback(() => {
    setFeedMode(FOLLOWING);
    setFeedModeCopy(FOLLOWING);
  }, [setFeedMode]);

  const handleWorldwideModeClick = useCallback(() => {
    setFeedMode(WORLDWIDE);
    setFeedModeCopy(WORLDWIDE);
  }, [setFeedMode]);

  return (
    <StyledFeedNavbarControl>
      <StyledTextWrapperLeft>
        <StyledNavControlText
          onClick={handleFollowingModeClick}
          focused={feedModeCopy === FOLLOWING}
        >
          Following
        </StyledNavControlText>
      </StyledTextWrapperLeft>
      <Spacer width={10} />
      <NavbarGLink />
      <Spacer width={10} />
      <StyledTextWrapper>
        <StyledNavControlText
          onClick={handleWorldwideModeClick}
          focused={feedModeCopy === WORLDWIDE}
        >
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

const StyledFeedNavbarControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export default function Feed() {
  const query = useLazyLoadQuery<FeedViewerQuery>(
    graphql`
      query FeedViewerQuery {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
            # ...FeedNavbarViewerFragment
          }
        }
      }
    `,
    {}
  );
  const { viewer } = query;
  const viewerUserId = (viewer?.user?.dbid ?? '') as string;
  const defaultFeedMode = viewerUserId ? FOLLOWING : WORLDWIDE;

  const [feedMode, setFeedMode] = useState<FeedMode>(defaultFeedMode);
  const { setCustomNavCenterContent } = useGlobalLayoutActions();

  // This effect ensures the Feed controls on the navbar are removed when the Feed unmounts, so that it is not visible when navigating to a different page.
  useEffect(() => {
    return () => {
      setTimeout(() => {
        setCustomNavCenterContent(null);
      }, 200);
    };
  }, [setCustomNavCenterContent]);

  // This effect handles adding and removing the Feed controls on the navbar when mounting this component, and signing in+out while on the Feed page.
  useEffect(() => {
    if (!viewerUserId) {
      setFeedMode(WORLDWIDE);
      setCustomNavCenterContent(null);
    } else {
      setCustomNavCenterContent(
        <FeedNavbarControl setFeedMode={setFeedMode} initialFeedMode={feedMode} />
      );
    }
    // don't add feedMode to the dep array. we only pass it in to set the initial state for the nav control, so we don't call setCustomNavCenterContent every time the feed mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCustomNavCenterContent, viewerUserId]);

  return (
    <StyledFeed>
      <Spacer height={24} />
      {viewerUserId && feedMode === FOLLOWING && <ViewerFeed viewerUserId={viewerUserId} />}
      {feedMode === WORLDWIDE && <GlobalFeed />}
    </StyledFeed>
  );
}

const StyledFeed = styled.div`
  width: 100vw;
  display: flex;
  flex: 1;
  flex-direction: column;
  @media only screen and ${breakpoints.desktop} {
    width: 842px;
  }
`;
