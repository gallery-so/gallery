/**
 * TODO__v1: This file should be moved to the onboarding flow
 */
import { useCallback, useState } from 'react';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

import { RouteComponentProps } from '@reach/router';
import styled, { css, keyframes, Keyframes } from 'styled-components';
import { useSpring, animated } from 'react-spring';
import './intro.css';
// TODO__v1: these pics should be URLs, not local files
import Pic1 from './__TEMP_PICS__/1.png';
import Pic2 from './__TEMP_PICS__/2.png';
import Pic3 from './__TEMP_PICS__/3.png';
import Pic4 from './__TEMP_PICS__/4.png';
import Pic5 from './__TEMP_PICS__/5.png';
import Pic6 from './__TEMP_PICS__/6.png';
import Pic7 from './__TEMP_PICS__/7.png';
import Pic8 from './__TEMP_PICS__/8.png';
import Pic9 from './__TEMP_PICS__/9.png';
import Pic10 from './__TEMP_PICS__/10.png';
import Pic11 from './__TEMP_PICS__/11.png';
import Pic12 from './__TEMP_PICS__/12.png';
import Pic13 from './__TEMP_PICS__/13.png';
import { useEffect } from 'react';

import transitions from 'components/core/transitions';

const calc = (x: number, y: number) => [
  x - window.innerWidth / 2,
  y - window.innerHeight / 2,
];
type AnimatedImage = {
  src?: string;
  width: number;
  // zIndex is the "depth" of image from viewer's pov.
  // It is used to calculate how the image will move based on mousemovement.
  // z-index of 0 is essentially the axis of movement. positive values move in one direction, negative values move in opposite.
  // values can be -100 to 100, with -100 being the furthest from viewer and 100 being closest.
  zIndex: number;
  offsetX: number;
  offsetY: number;
  originalOffsetX?: number;
  originalOffsetY?: number;
  fadeInDelay: number;
};

const animatedImages: AnimatedImage[] = [
  {
    src: Pic8, //chair
    width: 180,
    zIndex: -70,
    offsetX: 220,
    offsetY: -240,
    fadeInDelay: 800,
  },
  {
    src: Pic6, //punk
    width: 100,
    zIndex: -13,
    offsetX: -5,
    offsetY: 300,
    fadeInDelay: 0,
  },
  {
    src: Pic11, //statue
    width: 280,
    zIndex: 48,
    offsetX: 470,
    offsetY: 280,
    fadeInDelay: 300,
  },
  {
    src: Pic4, //squiggly
    width: 200,
    zIndex: 50,
    offsetX: -150,
    offsetY: -300,
    fadeInDelay: 0,
  },
  {
    src: Pic1, //controller
    width: 200,
    zIndex: 31,
    offsetX: -550,
    offsetY: -200,
    fadeInDelay: 1200,
  },
  {
    src: Pic13, //car
    width: 250,
    zIndex: 77,
    offsetX: -500,
    offsetY: 230,
    fadeInDelay: 500,
  },
  {
    src: Pic7, // trippy
    width: 220,
    zIndex: 25,
    offsetX: 500,
    offsetY: -100,
    fadeInDelay: 0,
  },
  // {
  //   src: Pic12, //billow
  //   width: 200,
  //   zIndex: 50,
  //   offsetX: 130,
  //   offsetY: 80,
  // },
];

const specialImages: AnimatedImage[] = [
  {
    src: Pic12, //billow
    width: 200,
    zIndex: 50,
    offsetX: 130,
    offsetY: 80,
    originalOffsetX: 0,
    originalOffsetY: 0,
    fadeInDelay: 0,
  },
  {
    src: Pic3, // pray
    width: 230,
    zIndex: -21,
    offsetX: -210,
    offsetY: -30,
    originalOffsetX: 0,
    originalOffsetY: 0,
    fadeInDelay: 0,
  },
];

const leftImage: AnimatedImage = {
  src: Pic3, // pray
  width: 230,
  zIndex: -21,
  offsetX: -210,
  offsetY: -30,
  originalOffsetX: 0,
  originalOffsetY: 0,
  fadeInDelay: 700,
};

const rightImage: AnimatedImage = {
  src: Pic12, //billow
  width: 200,
  zIndex: 50,
  offsetX: 130,
  offsetY: 80,
  originalOffsetX: 0,
  originalOffsetY: 0,
  fadeInDelay: 0,
};

function getTransformCallback(animatedImage: AnimatedImage) {
  // The mouse movement (x or y) will be divided by movementRatio to determine how much the image will move.
  // A larger movementRatio means the image will be moved less by the same mouse movement.
  // -500 is an arbitrarily large number so that we have a large range (-100~100) of z-index to work with,
  // without getting a movementRatio of 1. movementRatio of 1 moves the image too much.
  const movementRatio = -500 / animatedImage.zIndex;
  return (x: number, y: number) =>
    `translate3d(${x / movementRatio + animatedImage.offsetX}px,${
      y / movementRatio + animatedImage.offsetY
    }px,0)`;
}

type Props = {
  next: () => void;
};

export default function CoolIntro({ next }: Props) {
  const [props, set] = useSpring(() => ({
    xy: [0, 0],
    config: { mass: 10, tension: 550, friction: 140 },
  }));

  // if we want to use transitions instead of keyframes, we could add a class to each image after X seconds
  // to trigger the transition. Using a transition allows us to not have to add keyframes for each image.

  // const [isTextDisplayed, setIsTextDisplayed] = useState(false);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log('MOVE NOW');
  //     setIsTextDisplayed(true);
  //   }, 2000);
  // }, [setIsTextDisplayed]);
  const handleClick = useCallback(() => {
    // Delay next so we can show a transition animation
    setShouldFadeOut(true);
    setTimeout(() => {
      next();
    }, 2000);
  }, [next]);

  return (
    <StyledContainer
      onMouseMove={({ clientX: x, clientY: y }) => set({ xy: calc(x, y) })}
      // shouldFadeOut={shouldFadeOut}
    >
      <animated.div
        className="animate"
        style={{
          transform: props.xy.to(
            getTransformCallback({
              width: 300,
              zIndex: 2,
              offsetX: 0,
              offsetY: 0,
              fadeInDelay: 0,
            })
          ),
        }}
      >
        <StyledTextContainer shouldFadeOut={shouldFadeOut}>
          <Display>Welcome to Gallery</Display>
          <Spacer height={8} />
          <StyledBodyText color={colors.gray50}>
            This is your space to share your pieces and the stories that
            surround them. Curate, arrange, and display your collection exactly
            how it was meant to be.
          </StyledBodyText>
          <Spacer height={16} />
          <StyledButton text="Enter Gallery" onClick={handleClick} />
        </StyledTextContainer>
      </animated.div>
      {animatedImages.map((animatedImage) => (
        <animated.div
          className="animate"
          style={{
            transform: props.xy.interpolate(
              getTransformCallback(animatedImage)
            ),
          }}
        >
          <Image
            width={animatedImage.width}
            src={animatedImage.src}
            fadeInDelay={animatedImage.fadeInDelay}
            shouldFadeOut={shouldFadeOut}
          />
        </animated.div>
      ))}
      {/* {specialImages.map((specialImage) => ( */}
      <StyledTransformContainer
        direction="left"
        keyframes={createKeyframe(leftImage)}
      >
        <animated.div
          className="animate"
          style={{
            transform: props.xy.to(getTransformCallback(leftImage)),
          }}
        >
          <Image
            width={leftImage.width}
            src={leftImage.src}
            fadeInDelay={leftImage.fadeInDelay}
            shouldFadeOut={shouldFadeOut}
          />
        </animated.div>
      </StyledTransformContainer>
      <StyledTransformContainer
        direction="right"
        keyframes={createKeyframe(rightImage)}
      >
        <animated.div
          className="animate"
          style={{
            transform: props.xy.to(getTransformCallback(rightImage)),
          }}
        >
          <Image
            width={rightImage.width}
            src={rightImage.src}
            shouldFadeOut={shouldFadeOut}
            fadeInDelay={leftImage.fadeInDelay}
          />
        </animated.div>
      </StyledTransformContainer>
      {/* ))} */}
    </StyledContainer>
  );
}

const fadeInGrow = keyframes`
  from { opacity: 0; transform: scale(0.8); };
  to { opacity: 1; transform: scale(1.0); };
`;

const fadeOutGrow = keyframes`
  from { opacity: 1; transform: scale(1.0); };
  to { opacity: 0; transform: scale(1.8); };
`;

const fadeOut = keyframes`
  from { opacity: 1; };
  to { opacity: 0; };
`;

const StyledTextContainer = styled.div<{
  shouldFadeOut: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  animation: ${fadeInGrow} 2s forwards;
  animation-delay: 2s;

  ${({ shouldFadeOut }) =>
    shouldFadeOut &&
    css`
      animation: ${fadeOut} 2s forwards;
    `}
`;
// animation: ${fadeOutGrow} 2s forwards;

const moveLeft = keyframes`
  0% { transform: translate(0, 0)}
  50% { transform: translate(0, 0)}
  100% {transform: translate(-300px, 0);}
`;

const moveRight = keyframes`
  0% { transform: translate(0, 0)}
  50% { transform: translate(0, 0)}
  100% {transform: translate(150px, 0);}
`;

function createKeyframe(image: AnimatedImage) {
  return keyframes`
    0% { transform: translate(${image.originalOffsetX}, ${image.originalOffsetY})}
    50% { transform: translate(${image.originalOffsetX}, ${image.originalOffsetY})}
    100% {transform: translate(${image.offsetX}, ${image.offsetY});}
  `;
}

// Special container to translate images manually
const StyledTransformContainer = styled.div<{
  direction: string;
  keyframes: Keyframes;
}>`
  position: relative;
  animation: ${({ direction }) =>
    css`
      ${direction === 'left'
        ? moveLeft
        : moveRight} 4s ${transitions.cubic} forwards
    `};
`;

// animation: ${({keyframes}) => keyframes} 4s ${transitions.cubic} forwards;

const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeInGrow} 2s;
`;

const Image = styled.img<{
  width?: number;
  fadeInDelay: number;
  shouldFadeOut?: boolean;
}>`
  width: ${({ width }) => width}px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
  opacity: 0;
  animation: ${fadeInGrow} 2s forwards ${({ fadeInDelay }) => fadeInDelay}ms;

  ${({ shouldFadeOut, fadeInDelay }) =>
    shouldFadeOut &&
    css`
      animation: ${fadeOutGrow} 2s forwards ${fadeInDelay}ms;
      opacity: 1;
    `}
`;
// animation-delay: ${({ fadeInDelay }) => fadeInDelay}ms;

const StyledBodyText = styled(BodyRegular)`
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;
