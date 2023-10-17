import { memo, useEffect } from 'react';
import styled from 'styled-components';

import { DeprecatedButtonLink } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseXL } from '~/components/core/Text/Text';
import { useLogout } from '~/hooks/useLogout';

// Suggest a user visit this page if they're in a seriously broken state
function Nuke() {
  const logout = useLogout({});

  useEffect(() => {
    logout();
    localStorage.clear();
  }, [logout]);

  return (
    <StyledNuke gap={32}>
      <BaseXL>Your local cache has been nuked</BaseXL>
      <DeprecatedButtonLink href={{ pathname: '/' }}>Take me home</DeprecatedButtonLink>
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
