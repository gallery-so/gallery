import { memo, useCallback } from 'react';
import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import { useRouter } from 'next/router';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseS } from 'components/core/Text/Text';
import NavLink from 'components/core/NavLink/NavLink';

function Home() {
  const { push } = useRouter();

  const handleEnterGallery = useCallback(() => {
    // If the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    void push('/auth');
  }, [push]);

  return (
    <StyledHomePage>
      <GalleryIntro />
      <Spacer height={24} />
      <StyledButton text="Sign In" onClick={handleEnterGallery} dataTestId="sign-in-button" />
      <Spacer height={24} />
      <StyledLinkContainer>
        <NavLink to="/members" dataTestId="explore-button">
          Explore
        </NavLink>
        <Spacer width={8} />
        <BaseS>·</BaseS>
        <Spacer width={8} />
        <NavLink to="/walt">Gallery of the Week</NavLink>
      </StyledLinkContainer>
    </StyledHomePage>
  );
}

const StyledHomePage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  height: 100vh;
`;

const StyledButton = styled(Button)`
  width: 150px;
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

export default memo(Home);
