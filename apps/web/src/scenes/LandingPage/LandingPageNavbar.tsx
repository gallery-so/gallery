import { useCallback, useEffect, useState } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { SignInButton } from '~/contexts/globalLayout/GlobalNavbar/SignInButton';
import { SignUpButton } from '~/contexts/globalLayout/GlobalNavbar/SignUpButton';

export default function LandingPageNavbar() {
  const [opacity, setOpacity] = useState(0);

  const adjustNavbarOpacity = useCallback(() => {
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const startFade = 0.6 * windowHeight;
    const endFade = 0.9 * windowHeight;

    if (scrollY > startFade && scrollY < endFade) {
      const opacity = (scrollY - startFade) / (endFade - startFade);
      setOpacity(opacity);
    } else if (scrollY >= endFade) {
      setOpacity(1);
    } else {
      setOpacity(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', adjustNavbarOpacity);
    return () => {
      window.removeEventListener('scroll', adjustNavbarOpacity);
    };
  }, [adjustNavbarOpacity]);

  return (
    <StyledNavbar opacity={opacity}>
      <SignInButton buttonLocation="Landing Page Navbar" />
      <SignUpButton buttonLocation="Landing Page Navbar" />
    </StyledNavbar>
  );
}

const StyledNavbar = styled.div<{ opacity: number }>`
  opacity: ${({ opacity }) => opacity};
  position: fixed;
  top: 0;
  width: 100%;
  background: ${colors.white};
  z-index: 100;
  display: flex;
  gap: 16px;
  max-width: 1440px;
  justify-content: flex-end;
  padding: 16px 24px;
`;
