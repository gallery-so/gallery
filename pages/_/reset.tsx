import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';
import { TitleL, TitleS } from 'components/core/Text/Text';
import { THREE_ARROWS_CAPITAL_BANNER_KEY } from 'constants/storageKeys';
import usePersistedState from 'hooks/usePersistedState';
import { useEffect } from 'react';
import styled from 'styled-components';

export default function Secret() {
  const [, setDismissed] = usePersistedState(THREE_ARROWS_CAPITAL_BANNER_KEY, false);

  useEffect(() => {
    setDismissed(false);
  }, [setDismissed]);

  return (
    <StyledSecret>
      <TitleL>You've found the secret page</TitleL>
      <DeprecatedSpacer height={8} />
      <TitleS>The banner has been restored</TitleS>
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
