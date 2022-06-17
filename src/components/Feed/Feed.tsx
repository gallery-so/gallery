import ActionText from 'components/core/ActionText/ActionText';
import Spacer from 'components/core/Spacer/Spacer';
import NavbarGLink from 'components/NavbarGLink';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

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
      <ActionText onClick={handleFollowingModeClick} focused={feedModeCopy === FOLLOWING}>
        Following
      </ActionText>
      <Spacer width={10} />
      <NavbarGLink />
      <Spacer width={10} />
      <ActionText onClick={handleWorldwideModeClick} focused={feedModeCopy === WORLDWIDE}>
        Worldwide
      </ActionText>
    </StyledFeedNavbarControl>
  );
}

const StyledFeedNavbarControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Feed() {
  const [feedMode, setFeedMode] = useState<FeedMode>(WORLDWIDE);

  const { setCustomNavCenterContent } = useGlobalLayoutActions();
  useEffect(() => {
    setCustomNavCenterContent(
      <FeedNavbarControl setFeedMode={setFeedMode} initialFeedMode={feedMode} />
    );

    return () => {
      setCustomNavCenterContent(null);
    };
    // don't add feedMode to the dep array. we only pass it in to set the initial state for the nav control, so we don't call setCustomNavCenterContent every time the feed mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCustomNavCenterContent]);

  return (
    <div>
      <div>Feed</div>
      <div>{feedMode.toString()}</div>
    </div>
  );
}
