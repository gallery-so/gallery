import { memo, useEffect } from 'react';
import styled from 'styled-components';
import { BaseXL } from 'components/core/Text/Text';
import { ButtonLink } from 'components/core/Button/Button';
import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';
import { useAuthActions } from 'contexts/auth/AuthContext';

// Suggest a user visit this page if they're in a seriously broken state
function Nuke() {
  const { handleLogout } = useAuthActions();

  useEffect(() => {
    handleLogout();
    localStorage.clear();
  }, [handleLogout]);

  return (
    <StyledNuke>
      <BaseXL>Your local cache has been nuked</BaseXL>
      <DeprecatedSpacer height={32} />
      <ButtonLink href="/">Take me home</ButtonLink>
    </StyledNuke>
  );
}

const StyledNuke = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;

export default memo(Nuke);
