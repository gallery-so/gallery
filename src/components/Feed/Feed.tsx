import ActionText from 'components/core/ActionText/ActionText';
import Spacer from 'components/core/Spacer/Spacer';
import NavbarGLink from 'components/NavbarGLink';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

export const FOLLOWING = Symbol('FOLLOWING');
export const WORLDWIDE = Symbol('WORLDWIDE');
export type FeedMode = typeof FOLLOWING | typeof WORLDWIDE;

type ControlProps = {
  setFeedMode: (mode: FeedMode) => void;
};

function FeedNavbarControl({ setFeedMode }: ControlProps) {
  return (
    <StyledFeedNavbarControl>
      <ActionText onClick={() => setFeedMode(FOLLOWING)}>Following</ActionText>
      <Spacer width={10} />
      <NavbarGLink />
      <Spacer width={10} />
      <ActionText onClick={() => setFeedMode(WORLDWIDE)}>Worldwide</ActionText>
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
    setCustomNavCenterContent(<FeedNavbarControl setFeedMode={setFeedMode} />);

    return () => {
      setCustomNavCenterContent(null);
    };
  }, [setCustomNavCenterContent]);

  return (
    <div>
      <div>Feed</div>
      <div>{feedMode.toString()}</div>
    </div>
  );
}
