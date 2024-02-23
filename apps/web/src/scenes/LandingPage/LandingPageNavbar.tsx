import { useCallback, useEffect, useState } from 'react';
import { contexts, flows } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import { useBottomSheetActions } from '~/contexts/bottomsheet/BottomSheetContext';
import useUniversalAuthModal from '~/hooks/useUniversalAuthModal';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';

import { MobileAppsUpsellBottomSheet } from './MobileAppsUpsellBottomSheet';

export default function LandingPageNavbar() {
  const isMobile = useIsMobileWindowWidth();
  const [opacity, setOpacity] = useState(0);
  const showAuthModal = useUniversalAuthModal();
  const { showBottomSheet } = useBottomSheetActions();

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

  const handleClickGetStarted = useCallback(() => {
    if (isMobile) {
      showBottomSheet({
        content: <MobileAppsUpsellBottomSheet onContinueInBrowserClick={showAuthModal} />,
      });
      return;
    }
    showAuthModal();
  }, [isMobile, showAuthModal, showBottomSheet]);

  useEffect(() => {
    window.addEventListener('scroll', adjustNavbarOpacity);
    return () => {
      window.removeEventListener('scroll', adjustNavbarOpacity);
    };
  }, [adjustNavbarOpacity]);

  return (
    <StyledNavbar opacity={opacity}>
      <StyledButton
        eventElementId="Authenticate Button"
        eventName="Attempt Authenticate"
        eventContext={contexts.Onboarding}
        eventFlow={flows['Web Signup Flow']}
        onClick={handleClickGetStarted}
      >
        <StyledButtonText>Get Started</StyledButtonText>
      </StyledButton>
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
