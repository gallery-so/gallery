import ActionText from 'components/core/ActionText/ActionText';
import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import { fadeIn } from 'components/core/keyframes';
import Spacer from 'components/core/Spacer/Spacer';
import transitions from 'components/core/transitions';
import NavbarGLink from 'components/NavbarGLink';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
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
  // internally track the feed mode state so we can avoid adding it to the dep array
  const [feedModeCopy, setFeedModeCopy] = useState<FeedMode>(initialFeedMode);

  const { pathname } = useRouter();
  useEffect(() => {
    console.log(pathname);
  }, [pathname]);

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

  // transition: opacity ${transitions.cubic} ease-in-out;
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

// - signing out should remove "Following/Worldwide" from the navbar

export default function Feed() {
  const [feedMode, setFeedMode] = useState<FeedMode>(WORLDWIDE);
  // const [startFadeOut, setStartFadeout] = useState(false);

  const { setCustomNavCenterContent } = useGlobalLayoutActions();
  useEffect(() => {
    setCustomNavCenterContent(
      <FeedNavbarControl setFeedMode={setFeedMode} initialFeedMode={feedMode} />
    );

    return () => {
      setTimeout(() => {
        setCustomNavCenterContent(null);
      }, 200);
    };
    // don't add feedMode to the dep array. we only pass it in to set the initial state for the nav control, so we don't call setCustomNavCenterContent every time the feed mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCustomNavCenterContent]);

  return (
    <StyledFeed>
      <Spacer height={24} />
      {feedMode === FOLLOWING && <ViewerFeed />}
      {feedMode === WORLDWIDE && <GlobalFeed />}
      <div>{feedMode.toString()}</div>
    </StyledFeed>
  );
}

const StyledFeed = styled.div`
  width: 100vw;
  @media only screen and ${breakpoints.desktop} {
    width: 842px;
  }
`;
