import { useCallback, useEffect, useState } from 'react';
import colors from 'shared/theme/colors';
import styled, { css, keyframes } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { StyledContainer } from '~/contexts/modal/AnimatedModal';
import CloseIcon from '~/icons/CloseIcon';

type Props = {
  toggleLightbox: () => void;
  isLightboxOpen: boolean;
  tokenId: string;
};

const TRANSITION_TIME = 500;

export function getLightboxPortalElementId(tokenId: string) {
  return `lightbox-portal-${tokenId}`;
}

// This component is used to display an NFT in fullscreen.
// It is responsible for the transition animations including sizing and fullscreen background.
// To display the NFT itself, this component simply creates a portal destination in which another component (such as TokenDetailAsset) can place an NFT asset view inside.
// This is necessary to use the exact same rendered asset when viewing it in on both fullscreen and non-fullscreen modes to achieve a seamless transition.
export default function NftDetailLightbox({ toggleLightbox, isLightboxOpen, tokenId }: Props) {
  const [distanceFromLeft, setDistanceFromLeft] = useState(0);
  const [distanceFromTop, setDistanceFromTop] = useState(0);

  const measuredRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      const rect = node.getBoundingClientRect();
      setDistanceFromLeft(rect.left);
      setDistanceFromTop(rect.top);
    }
  }, []);

  const handleCloseClick = useCallback(() => {
    setShouldFadeOut(true);
    toggleLightbox();
  }, [toggleLightbox]);

  // we have a separate state for the background because we need to delay unmounting it to show the fade out animation
  const [showBackground, setShowBackground] = useState(isLightboxOpen);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  // figure out how to only scroll for active ref (for nft detail view)
  useEffect(() => {
    if (isLightboxOpen) {
      setShowBackground(true);
    } else {
      setTimeout(() => {
        setShowBackground(false);
        setShouldFadeOut(false);
      }, TRANSITION_TIME);
    }
  }, [, isLightboxOpen]);

  return (
    <>
      {showBackground && (
        <StyledBackground isLightboxOpen={isLightboxOpen} shouldFadeOut={shouldFadeOut} />
      )}
      {isLightboxOpen && (
        <StyledCloseButton onClick={handleCloseClick}>
          <CloseIcon />
        </StyledCloseButton>
      )}
      <StyledLightbox
        ref={measuredRef}
        isLightboxOpen={isLightboxOpen}
        distanceFromLeft={distanceFromLeft}
        distanceFromTop={distanceFromTop}
      >
        <StyledAssetPortalDestination
          // make the id unique by using tokenId because if there are next/prev nfts, they will also have their own lightbox-portals
          id={getLightboxPortalElementId(tokenId)}
        />
      </StyledLightbox>
    </>
  );
}

const StyledCloseButton = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 15;
  color: ${colors.white};
  cursor: pointer;
`;

const StyledLightbox = styled.div<{
  isLightboxOpen: boolean;
  distanceFromLeft: number;
  distanceFromTop: number;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12;

  color: ${colors.white};
  transition: width ${TRANSITION_TIME}ms, height ${TRANSITION_TIME}ms, left ${TRANSITION_TIME}ms,
    padding ${TRANSITION_TIME}ms;

  top: 0;

  @media only screen and ${breakpoints.tablet} {
    top: initial;
  }

  ${({ isLightboxOpen, distanceFromLeft }) =>
    isLightboxOpen &&
    `
    left: -${distanceFromLeft}px;
    height: 100vh;
    width: 100vw;
    padding: 40px 0;

    
    ${StyledContainer} {
      overflow:hidden;
    }

    @media only screen and ${breakpoints.tablet} {
      padding: 56px;
    }

    @media only screen and ${breakpoints.desktop} {
      padding: 80px;
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
const StyledBackground = styled.div<{
  isLightboxOpen: boolean;
  shouldFadeOut: boolean;
}>`
  position: fixed;
  width: 100%;
  opacity: 0.96;
  height: 100%;
  top: 0;
  left: 0;
  transition: opacity ${TRANSITION_TIME}ms;
  animation: ${fadeIn} ${TRANSITION_TIME}ms;

  background: ${colors.black['800']};

  ${({ shouldFadeOut }) =>
    shouldFadeOut &&
    css`
      animation: ${fadeOut} ${TRANSITION_TIME}ms;
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
