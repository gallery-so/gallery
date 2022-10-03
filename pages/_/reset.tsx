import { VStack } from 'components/core/Spacer/Stack';
import { TitleL, TitleS } from 'components/core/Text/Text';
import { TEZOS_ANNOUNCEMENT_STORAGE_KEY } from 'constants/storageKeys';
import usePersistedState from 'hooks/usePersistedState';
import { useEffect } from 'react';
import styled from 'styled-components';

export default function Secret() {
  const [, setDismissed] = usePersistedState(TEZOS_ANNOUNCEMENT_STORAGE_KEY, false);

  useEffect(() => {
    setDismissed(false);
  }, [setDismissed]);

  return (
    <StyledSecret gap={8}>
      <TitleL>You've found the secret page</TitleL>
      <TitleS>The banner has been restored</TitleS>
    </StyledSecret>
  );
}

const StyledSecret = styled(VStack)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;
