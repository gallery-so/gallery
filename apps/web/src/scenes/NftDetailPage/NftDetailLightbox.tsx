import { useCallback, useEffect, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import styled, { css, keyframes } from 'styled-components';

import { NftDetailLightboxFragment$key } from '~/generated/NftDetailLightboxFragment.graphql';
import useWindowSize from '~/hooks/useWindowSize';
import CloseIcon from '~/icons/CloseIcon';

import NftDetailAsset from './NftDetailAsset';

type Props = {
  collectionTokenRef: NftDetailLightboxFragment$key;
  toggleLightbox: () => void;
  isLightboxOpen: boolean;
};

export default function NftDetailLightbox({ toggleLightbox, isLightboxOpen }: Props) {
  // const token = useFragment(
  //   graphql`
  //     fragment NftDetailLightboxFragment on CollectionToken {
  //       id
  //       ...NftDetailAssetFragment
  //     }
  //   `,
  //   collectionTokenRef
  // );
  // console.log({ collectionTokenRef });
  console.log({ isLightboxOpen });

  // {/* <NftDetailAsset
  //   tokenRef={token}
  //   hasExtraPaddingForNote={false}
  //   toggleLightbox={toggleLightbox}
  // /> */}
  const ref = useRef(null);
  const [distanceFromLeft, setDistanceFromLeft] = useState(0);

  const { width } = useWindowSize();

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      console.log(rect);
      setDistanceFromLeft(rect.left);
    }
  }, [width]); // Empty dependency array means this runs once on mount

  console.log({ distanceFromLeft });

  const handleCloseClick = useCallback(() => {
    setShouldFadeOut(true);
    toggleLightbox();
    // setTimeout(() => {
    // }, 500);
    // toggleLightbox();
    console.log('close');
  }, [toggleLightbox]);

  // separate state for background because we need to delay unmounting it to show the fade out animation
  const [showBackground, setShowBackground] = useState(isLightboxOpen);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  // const

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
        <StyledAssetPortalDestination id="lightbox-portal"></StyledAssetPortalDestination>
      </StyledLightbox>
      {showBackground && (
        <StyledBackground
          isLightboxOpen={isLightboxOpen}
          shouldFadeOut={shouldFadeOut}
        ></StyledBackground>
      )}
    </>
  );
}

const LightboxContainer = styled.div``;

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
  // top: 0;
  left: 0;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: ${colors.white};
  transition: width 0.5s, height 0.5s, left 0.5s, padding 0.5s;
  // border: 1px solid green;
  ${({ isLightboxOpen, distanceFromLeft }) =>
    isLightboxOpen &&
    `
  padding: 80px;
  // position: fixed;
  // top: 0;
  // left: 0;
  // background-color: ${colors.black['800']};
    left: -${distanceFromLeft}px;
    height: 100vh;
    width: 100vw;
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
  // display: none;
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
  // border: 1px solid red;
  transition: width 1s, height 1s;
  position: relative;
`;
