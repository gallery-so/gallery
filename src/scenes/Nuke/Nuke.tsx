import { memo, useEffect } from 'react';
import styled from 'styled-components';

import { ButtonLink } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseXL } from '~/components/core/Text/Text';
import { useAuthActions } from '~/contexts/auth/AuthContext';

// Suggest a user visit this page if they're in a seriously broken state
function Nuke() {
  const { handleLogout } = useAuthActions();

  useEffect(() => {
    handleLogout();
    localStorage.clear();
  }, [handleLogout]);

  return (
    <StyledNuke gap={32}>
      <BaseXL>Your local cache has been nuked</BaseXL>
      <ButtonLink href={{ pathname: '/' }}>Take me home</ButtonLink>
    </StyledNuke>
  );
}

const StyledNuke = styled(VStack)`
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;

export default memo(Nuke);
