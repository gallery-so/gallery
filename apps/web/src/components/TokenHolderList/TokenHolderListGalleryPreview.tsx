import { useCallback, useMemo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

import colors from '~/shared/theme/colors';
import { Directions } from '~/components/core/enums';
import { GOOGLE_CONTENT_IMG_URL } from '~/utils/regex';

const verticalOffset = [0, 130, 260];
const horizontalOffset = [0, 90, 180];

function shuffle(array: number[]) {
  return array.sort(() => 0.5 - Math.random());
}

// Randomly generates positions for each nftUrl, ensuring an image will always occupy top/midle/bottom and left/middle/right.
function getImagePositions(tokenUrls: string[]) {
  // shuffle the offset arrays so images can end up in any combination of top/middle/bottom and left/middle/right.
  const shuffledVerticalOffset = shuffle(verticalOffset);
  const shuffledHorizontalOffset = shuffle(horizontalOffset);

  // offset each image by one of the three possible offset amounts and additionally randomly offset by up to 40px.
  return tokenUrls.map((url, index) => {
    const verticalOffset = shuffledVerticalOffset[index] ?? 0;
    const horizontalOffset = shuffledHorizontalOffset[index] ?? 0;

    return {
      top: verticalOffset + Math.random() * 40,
      left: horizontalOffset + Math.random() * 40,
    };
  });
}

// Randomly generates parameters for keyframe animation for each image, so that each image floats a bit differently.
// x and y values have a 50-50 chance of being positive or negative, so that the images float in a random direction.
function getAnimationMovement() {
  return {
    x: Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1),
    y: Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1),
    time: Math.random() * 2 + 6, // animation duration is 6-8 seconds
  };
}

// for images stored in google, add or replace the size param
function getFormattedImageUrl(url: string) {
  if (!url.includes('googleusercontent')) {
    return url;
  }

  if (url.match(GOOGLE_CONTENT_IMG_URL)) {
    return url.replace(GOOGLE_CONTENT_IMG_URL, '=w250');
  }

  return `${url}=w250`;
}

type PreviewImageProps = {
  src: string;
  top: number;
  left: number;
  movement: {
    x: number;
    y: number;
    time: number;
  };
};

function PreviewImage({ src, top, left, movement }: PreviewImageProps) {
  // use the isLoaded state to trigger the image to fade in after it's loaded, so the image doesn't appear suddenly
  const [isLoaded, setIsLoaded] = useState(false);
  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <StyledPreviewImage
      src={getFormattedImageUrl(src)}
      top={top}
      left={left}
      movement={movement}
      onLoad={onLoad}
      isLoaded={isLoaded}
    />
  );
}

type TokenHolderListGalleryPreviewProps = {
  direction: Directions.LEFT | Directions.RIGHT;
  tokenUrls: string[];
  startFadeOut?: boolean;
};

function TokenHolderListGalleryPreview({
  direction,
  tokenUrls,
  startFadeOut,
}: TokenHolderListGalleryPreviewProps) {
  const animationMovements = useMemo(
    () => tokenUrls.map(() => getAnimationMovement()),
    [tokenUrls]
  );
  const imagePositions = useMemo(() => getImagePositions(tokenUrls), [tokenUrls]);

  return (
    <StyledPreview>
      <StyledPreviewImageWrapper direction={direction} startFadeOut={startFadeOut}>
        {tokenUrls.map((url, index) => {
          const position = imagePositions[index];
          const movement = animationMovements[index];

          if (!position || !movement) {
            return null;
          }

          return (
            <PreviewImage
              key={url}
              src={url}
              top={position.top}
              left={position.left}
              movement={movement}
            />
          );
        })}
      </StyledPreviewImageWrapper>
    </StyledPreview>
  );
}

const StyledPreview = styled.div`
  position: relative;
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

type StyledPreviewImageWrapperProps = {
  direction: Directions.LEFT | Directions.RIGHT;
  startFadeOut?: boolean;
};

const StyledPreviewImageWrapper = styled.div<StyledPreviewImageWrapperProps>`
  position: absolute;
  top: -250px;
  left: ${({ direction }) => (direction === Directions.RIGHT ? '50px' : '-600px')};

  ${({ startFadeOut }) =>
    startFadeOut &&
    css`
      animation: ${fadeOut} 0.5s forwards;
    `}
`;

const float = (x: number, y: number) => keyframes`
  0% {
    transform: translate(0px, 0px);
  }

  50% {
    transform: translate(${x}px, ${y}px);
  }

  100% {
    transform: translate(0px, 0px);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

type Movement = {
  x: number;
  y: number;
  time: number;
};

type StyledPreviewImageProps = {
  top: number;
  left: number;
  movement: Movement;
  isLoaded: boolean;
};

const StyledPreviewImage = styled.img<StyledPreviewImageProps>`
  position: absolute;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  background-color: ${colors.white};
  width: 250px;
  opacity: 0;
  box-shadow: rgba(0, 0, 0, 0.2) 0 18px 50px -10px;

  ${({ isLoaded, movement }) =>
    isLoaded &&
    css`
      animation: ${float(movement.x, movement.y)} ${movement.time}s ease-in-out infinite,
        ${fadeIn} 0.5s forwards;
    `}
`;

export default TokenHolderListGalleryPreview;
