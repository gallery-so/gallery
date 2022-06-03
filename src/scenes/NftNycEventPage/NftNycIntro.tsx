import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseXL, TitleM } from 'components/core/Text/Text';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type Props = {
  setShowDetails: (showDetails: boolean) => void;
};

export default function NftNycIntro({ setShowDetails }: Props) {
  const screenRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    screenRef.current?.style.setProperty('--cursorX', event.x + 'px');
    screenRef.current?.style.setProperty('--cursorY', event.y + 'px');
  }, []);

  const handleTouchMove = useCallback((document: Document, event: TouchEvent) => {
    screenRef.current?.style.setProperty('--cursorX', event.touches[0].clientX + 'px');
    screenRef.current?.style.setProperty('--cursorY', event.touches[0].clientY + 'px');
  }, []);

  const handleEnterClick = useCallback(() => {
    setShowDetails(true);
  }, [setShowDetails]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    // document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      //   document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove]);

  // Hide the text by default in case the flashlight (cursor) is already on the middle of the screen.
  // This is so we don't ruin the surprise on page load, and force the user to move the flashlight a bit before the text can be revealed.
  // Once the cursor moves outside of the center boundary, the text will become available.
  const [revealText, setRevealText] = useState(false);

  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // if the cursor is not in the middle of screen, reveal the text
    const target = event.target as HTMLDivElement;
    if (target.id !== 'boundary') {
      setRevealText(true);
      event.stopPropagation();
    }
  }, []);

  const handleMouseOut = useCallback(() => {
    setRevealText(true);
  }, []);

  return (
    <StyledBlackoutScreen ref={screenRef} onMouseEnter={handleMouseEnter}>
      <StyledBoundary id="boundary" onMouseLeave={handleMouseOut} revealText={revealText}>
        <StyledContentWrapper revealText={revealText}>
          <StyledLogo src="/icons/logo-large.svg" />
          <Spacer height={4} />
          <TitleM>nft.nyc 2022</TitleM>
          <Spacer height={8} />

          <StyledLinkContainer>
            <StyledEnterButton onClick={handleEnterClick}>
              <BaseXL>
                <strong>ENTER</strong>
              </BaseXL>
            </StyledEnterButton>
          </StyledLinkContainer>
        </StyledContentWrapper>
      </StyledBoundary>
    </StyledBlackoutScreen>
  );
}

const StyledBlackoutScreen = styled.div`
height: 100%;
width: 100%;
display: flex;
justify-content: center;
align-items: center;
flex-direction: column;
--cursorX: 50vw;
--cursorY: -20vh;

&:before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  position: fixed;
  pointer-events: none;
  background: radial-gradient(circle 5vmax at var(--cursorX) var(--cursorY),
  rgba(20,20,20,0) 10%,
  rgba(20,20,20,0.25) 65%,
  rgba(20,20,20,0.3) 70%,
  rgba(20,20,20,0.35) 75%,
  rgba(20,20,20,0.4) 80%,
  rgba(20,20,20,1) 100%);
    )
}
`;

const StyledBoundary = styled.div<{ revealText: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 500px;
  height: 400px;
`;

const StyledContentWrapper = styled.div<{ revealText: boolean }>`
  visibility: ${({ revealText }) => (revealText ? 'visible' : 'hidden')};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StyledLogo = styled.img`
  height: 32px;
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

const StyledEnterButton = styled.button`
  font-size: 18px;
  color: ${colors.offBlack};
  border: none;
  background: none;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    text-decoration: none;
  }
`;
