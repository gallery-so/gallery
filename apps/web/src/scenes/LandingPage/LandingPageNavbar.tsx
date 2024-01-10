import { useEffect, useState } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { SignInButton } from '~/contexts/globalLayout/GlobalNavbar/SignInButton';
import { SignUpButton } from '~/contexts/globalLayout/GlobalNavbar/SignUpButton';

export default function LandingPageNavbar() {
  const [show, setShow] = useState(false);

  const controlNavbar = () => {
    if (window.scrollY > window.innerHeight * 0.6) {
      console.log('hello');
      // 100 is the scroll point you can adjust
      setShow(true);
    } else {
      setShow(false);
    }
  };

  const [opacity, setOpacity] = useState(0);

  const adjustNavbarOpacity = () => {
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
  };

  useEffect(() => {
    console.log(opacity);
  }, [opacity]);

  useEffect(() => {
    window.addEventListener('scroll', adjustNavbarOpacity);
    return () => {
      window.removeEventListener('scroll', adjustNavbarOpacity);
    };
  }, []);

  return (
    <StyledNavbar show={show} opacity={opacity}>
      <SignInButton />
      <SignUpButton />
    </StyledNavbar>
  );
}

const StyledNavbar = styled.div<{ show: boolean; opacity: number }>`
  // opacity: ${({ show }) => (show ? '1' : '0')};
  opacity: ${({ opacity }) => opacity};
  // transition: opacity 0.5s ease;
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
