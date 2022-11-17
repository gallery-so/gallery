import { useEffect } from 'react';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleL, TitleS } from '~/components/core/Text/Text';
import { WHITE_RHINO_STORAGE_KEY } from '~/constants/storageKeys';
import usePersistedState from '~/hooks/usePersistedState';

export default function Secret() {
  const [, setDismissed] = usePersistedState(WHITE_RHINO_STORAGE_KEY, false);

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
