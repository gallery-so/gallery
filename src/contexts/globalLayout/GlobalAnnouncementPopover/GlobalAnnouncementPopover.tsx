import colors from 'components/core/colors';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

// NOTE: in order to toggle whether the modal should appear for authenticated users only,
// refer to `useGlobalAnnouncementPopover.tsx`
export default function GlobalAnnouncementPopover() {
  const { hideModal } = useModalActions();

  const [frame, setFrame] = useState(1);
  const incrementFrame = useCallback(() => {
    setFrame((f) => f + 1);
  }, []);

  const FIRST_FRAME_MS = 3000;

  useEffect(() => {
    if (frame === 1) {
      setTimeout(() => {
        incrementFrame();
      }, FIRST_FRAME_MS);
    }

    if (frame === 2) {
      hideModal();
    }
  }, [frame, hideModal, incrementFrame]);

  return (
    <StyledGlobalAnnouncementPopover>
      <IntroText>The</IntroText>
      <IntroTextItalic>Unofficial</IntroTextItalic>
      <IntroText>3AC Gallery</IntroText>
    </StyledGlobalAnnouncementPopover>
  );
}

const StyledGlobalAnnouncementPopover = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.offBlack};
  height: 100vh;
  width: 100vw;
`;

const IntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 32px;
  line-height: 36px;
  letter-spacing: -0.03em;
  color: ${colors.white};
`;

const IntroTextItalic = styled.span`
  padding: 0px 8px;

  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 32px;
  line-height: 36px;
  font-style: italic;
  color: ${colors.white};
`;
