import { useCallback, useEffect, useMemo, useState } from 'react';
import { contexts, flows } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import { SignInButton } from '~/contexts/globalLayout/GlobalNavbar/SignInButton';
import { SignUpButton } from '~/contexts/globalLayout/GlobalNavbar/SignUpButton';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import isIOS from '~/utils/isIOS';

import { APP_STORE_URL } from './LandingPage';

export default function LandingPageNavbar() {
  const isIosDevice = useMemo(() => isIOS(), []);
  const isMobile = useIsMobileWindowWidth();
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
      {isMobile && isIosDevice ? (
        <GalleryLink href={APP_STORE_URL} target="_blank">
          <StyledButton
            eventElementId="Landing Page Navbar Download Button"
            eventName="Clicked Landing Page Navbar Download Button"
            eventContext={contexts.Onboarding}
            eventFlow={flows['Web Signup Flow']}
          >
            <StyledButtonText>Download</StyledButtonText>
          </StyledButton>
        </GalleryLink>
      ) : (
        <SignUpButton buttonLocation="Landing Page Navbar" />
      )}
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

const StyledButton = styled(Button)`
  padding: 8px 24px;
`;

const StyledButtonText = styled(TitleDiatypeL)`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: ${colors.white};
`;
