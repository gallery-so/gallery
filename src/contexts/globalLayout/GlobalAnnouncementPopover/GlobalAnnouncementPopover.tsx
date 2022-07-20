import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
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

  const FIRST_FRAME_MS = 1200;
  const SECOND_FRAME_MS = 2500;
  const THIRD_FRAME_MS = 3000;

  useEffect(() => {
    setTimeout(() => {
      incrementFrame();
    }, FIRST_FRAME_MS);

    setTimeout(() => {
      incrementFrame();
    }, FIRST_FRAME_MS + SECOND_FRAME_MS);

    setTimeout(() => {
      incrementFrame();
    }, FIRST_FRAME_MS + SECOND_FRAME_MS + THIRD_FRAME_MS);
  }, [incrementFrame]);

  useEffect(() => {
    if (frame === 4) hideModal();
  }, [frame, hideModal]);

  return (
    <StyledGlobalAnnouncementPopover>
      {frame < 3 ? (
        <FirstFrameContainer bringToCenter={frame === 2}>
          <IntroText>Figure31</IntroText>
          <IntroTextItalic visible={frame === 2}>presents</IntroTextItalic>
        </FirstFrameContainer>
      ) : (
        <IntroText>MARK</IntroText>
      )}
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

const FirstFrameContainer = styled.div<{ bringToCenter: boolean }>`
  transform: ${({ bringToCenter }) => `translateX(${bringToCenter ? 0 : 47}px)`};
  transition: ${transitions.cubic};
`;

const IntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 32px;
  line-height: 36px;
  letter-spacing: -0.03em;
  color: ${colors.white};
`;

const IntroTextItalic = styled.span<{ visible: boolean }>`
  padding-left: 12px;

  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 32px;
  line-height: 36px;
  font-style: italic;
  color: ${colors.white};

  transition: ${transitions.cubic};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;
