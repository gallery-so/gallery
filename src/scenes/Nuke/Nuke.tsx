import { memo, useEffect } from 'react';
import styled from 'styled-components';
import { BaseXL } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
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
      <Spacer height={32} />
      <GalleryLink to="/">
        <StyledButton text="Take me home" />
      </GalleryLink>
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

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default memo(Nuke);
