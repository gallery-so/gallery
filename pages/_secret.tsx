import Spacer from 'components/core/Spacer/Spacer';
import { TitleL, TitleS } from 'components/core/Text/Text';
import { FEED_ANNOUNCEMENT_STORAGE_KEY } from 'constants/storageKeys';
import usePersistedState from 'hooks/usePersistedState';
import { useEffect } from 'react';
import styled from 'styled-components';

export default function Secret() {
  const [, setDismissed] = usePersistedState(FEED_ANNOUNCEMENT_STORAGE_KEY, false);

  useEffect(() => {
    setDismissed(false);
  }, [setDismissed]);

  return (
    <StyledSecret>
      <TitleL>You've found the secret page</TitleL>
      <Spacer height={8} />
      <TitleS>The popover has been restored</TitleS>
    </StyledSecret>
  );
}

const StyledSecret = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;
