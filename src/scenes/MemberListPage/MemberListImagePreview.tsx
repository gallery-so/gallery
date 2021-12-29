import styled, { css, keyframes } from 'styled-components';
import { Directions } from 'src/components/core/enums';
import { useMemo } from 'react';

const verticalOffset = [0, 130, 260];
const horizontalOffset = [0, 90, 180];

function shuffle(array: number[]) {
  return array.sort(() => 0.5 - Math.random());
}

// Randomly generates positions for each nftUrl, ensuring an image will always occupy top/midle/bottom and left/middle/right.
function getImagePositions(nftUrls: string[]) {
  // shuffle the offset arrays so images can end up in any combination of top/middle/bottom and left/middle/right.
  const shuffledVerticalOffset = shuffle(verticalOffset);
  const shuffledHorizontalOffset = shuffle(horizontalOffset);

  // offset each image by one of the three possible offset amounts and additionally randomly offset by up to 40px.
  return nftUrls.map((url, index) => ({
    top: shuffledVerticalOffset[index] + Math.random() * 40,
    left: shuffledHorizontalOffset[index] + Math.random() * 40,
  }));
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

type Props = {
  direction: Directions.LEFT | Directions.RIGHT;
  nftUrls: string[];
  startFadeOut?: boolean;
};

function MemberListImagePreview({ direction, nftUrls, startFadeOut }: Props) {
  const animationMovements = useMemo(() => nftUrls.map(() => getAnimationMovement()), [nftUrls]);
  const imagePositions = useMemo(() => getImagePositions(nftUrls), [nftUrls]);

  return (
    <StyledPreview>
      <StyledPreviewImageWrapper direction={direction} startFadeOut={startFadeOut}>
        {nftUrls.map((url, index) => (
          <StyledPreviewImage
            key={url}
            src={`${url}=w250`}
            top={imagePositions[index].top}
            left={imagePositions[index].left}
            movement={animationMovements[index]}
          />
        ))}
      </StyledPreviewImageWrapper>
    </StyledPreview>
  );
}

const StyledPreview = styled.div`
  position: relative;
`;

const fadeOut = keyframes`
  from { opacity: 1; };
  to { opacity: 0; };
`;

type StyledPreviewImageWrapperProps = {
  direction: Directions.LEFT | Directions.RIGHT;
  startFadeOut?: boolean;
};

const StyledPreviewImageWrapper = styled.div<StyledPreviewImageWrapperProps>`
  position: absolute;
  top: -250px;
  left: ${({ direction }) => (direction === Directions.RIGHT ? '50px' : '-550px')};

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
  from { opacity: 0; };
  to { opacity: 1; };
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
};

const StyledPreviewImage = styled.img<StyledPreviewImageProps>`
  position: absolute;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 18px 50px -10px;
  animation: ${({ movement }) => float(movement.x, movement.y)} ${({ movement }) => movement.time}s
      ease-in-out infinite,
    ${fadeIn} 0.5s forwards;
`;

export default MemberListImagePreview;
