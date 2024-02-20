import { useCallback, useEffect, useRef, useState } from 'react';
import colors from 'shared/theme/colors';
import styled, { css, keyframes } from 'styled-components';

import { StyledContainer } from '~/contexts/modal/AnimatedModal';
import CloseIcon from '~/icons/CloseIcon';

type Props = {
  toggleLightbox: () => void;
  isLightboxOpen: boolean;
  tokenId: string;
};

// This component is used to display an NFT in fullscreen.
// It is responsible for the transition animations including sizing and fullscreen background.
// To display the NFT itself, this component simply creates a portal destination in which another component (such as TokenDetailAsset) can place an NFT asset view inside.
// This is necessary to use the exact same rendered asset when viewing it in on both fullscreen and non-fullscreen modes to achieve a seamless transition.
export default function NftDetailLightbox({ toggleLightbox, isLightboxOpen, tokenId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [distanceFromLeft, setDistanceFromLeft] = useState(0);

  // Because the lightbox is originally positioned absolutely relative to the displayed nft on the detail page, when the lightbox is opened to be fullscreen
  // we have to manually position it to aligned with the edge of the browser window.
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDistanceFromLeft(rect.left);
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleCloseClick = useCallback(() => {
    setShouldFadeOut(true);
    toggleLightbox();
  }, [toggleLightbox]);

  // we have a separate state for the background because we need to delay unmounting it to show the fade out animation
  const [showBackground, setShowBackground] = useState(isLightboxOpen);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  useEffect(() => {
    if (isLightboxOpen) {
      setShowBackground(true);
    } else {
      setTimeout(() => {
        setShowBackground(false);
        setShouldFadeOut(false);
      }, 500);
    }
  }, [isLightboxOpen]);

  return (
    <>
      {isLightboxOpen && (
        <StyledCloseButton onClick={handleCloseClick}>
          <CloseIcon />
        </StyledCloseButton>
      )}
      <StyledLightbox ref={ref} isLightboxOpen={isLightboxOpen} distanceFromLeft={distanceFromLeft}>
        <StyledAssetPortalDestination
          // make the id unique by using tokenId because if there are next/prev nfts, they will also have their own lightbox-portals
          id={`lightbox-portal-${tokenId}`}
        />
      </StyledLightbox>
      {showBackground && (
        <StyledBackground isLightboxOpen={isLightboxOpen} shouldFadeOut={shouldFadeOut} />
      )}
    </>
  );
}

const StyledCloseButton = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 100000;
  color: ${colors.white};
  cursor: pointer;
`;

const StyledLightbox = styled.div<{ isLightboxOpen: boolean; distanceFromLeft: number }>`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: ${colors.white};
  transition: width 0.5s, height 0.5s, left 0.5s, padding 0.5s;

  ${({ isLightboxOpen, distanceFromLeft }) =>
    isLightboxOpen &&
    `
    padding: 80px;
    left: -${distanceFromLeft}px;
    height: 100vh;
    width: 100vw;
    
    ${StyledContainer} {
      overflow:hidden;
    }
    `};
`;

const fadeIn = keyframes`
    from { opacity: 0 };
    to { opacity: 0.96 };
`;
const fadeOut = keyframes`
    from { opacity: 0.96 };
    to { opacity: 0 };
`;
const StyledBackground = styled.div<{ isLightboxOpen: boolean; shouldFadeOut: boolean }>`
  position: fixed;
  width: 100%;
  opacity: 0.96;
  height: 100%;
  top: 0;
  left: 0;
  transition: opacity 0.5s;
  animation: ${fadeIn} 0.5s;
  backdrop-filter: blur(50px);
  background: ${colors.black['800']};

  ${({ shouldFadeOut }) =>
    shouldFadeOut &&
    css`
      animation: ${fadeOut} 0.5s;
      opacity: 0;
    `}
`;

const StyledAssetPortalDestination = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  transition: width 1s, height 1s;
  position: relative;
`;
