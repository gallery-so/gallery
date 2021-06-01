/**
 * TODO__v1: This file should be moved to the onboarding flow
 */
import { useCallback, useState } from 'react';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

import styled, { css, keyframes } from 'styled-components';
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
  offsetXStart: number;
  offsetYStart: number;
  fadeInDelay: number;
};

const animatedImages: AnimatedImage[] = [
  {
    src: Pic8, //chair
    width: 180,
    zIndex: -40,
    offsetX: 180,
    offsetY: -370,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 800,
  },
  {
    src: Pic6, //punk
    width: 100,
    zIndex: -13,
    offsetX: -105,
    offsetY: 210,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 0,
  },
  {
    src: Pic11, //statue
    width: 280,
    zIndex: -18,
    offsetX: 370,
    offsetY: 100,
    offsetXStart: -20,
    offsetYStart: -12,
    fadeInDelay: 300,
  },
  {
    src: Pic4, //squiggly
    width: 200,
    zIndex: 20,
    offsetX: -150,
    offsetY: -390,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 0,
  },
  {
    src: Pic1, //controller
    width: 200,
    zIndex: 11,
    offsetX: -550,
    offsetY: -340,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 1200,
  },
  {
    src: Pic13, //car
    width: 250,
    zIndex: 37,
    offsetX: -490,
    offsetY: 110,
    offsetXStart: 0,
    offsetYStart: 30,
    fadeInDelay: 500,
  },
  {
    src: Pic7, // trippy
    width: 220,
    zIndex: 25,
    offsetX: 440,
    offsetY: -240,
    offsetXStart: -40,
    offsetYStart: 0,
    fadeInDelay: 0,
  },
  {
    src: Pic12, //billow
    width: 200,
    zIndex: 30,
    offsetX: 80,
    offsetY: 150,
    offsetXStart: 0,
    offsetYStart: -40,
    fadeInDelay: 300,
  },
  {
    src: Pic3, // pray
    width: 230,
    zIndex: -11,
    offsetX: -660,
    offsetY: -120,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 0,
  },
];

const textAnimationOptions = {
  width: 300,
  zIndex: 2,
  offsetX: 0,
  offsetY: 0,
  offsetXStart: 0,
  offsetYStart: 0,
  fadeInDelay: 0,
};

function getTransformCallback(animatedImage: AnimatedImage) {
  // The mouse movement (x or y) will be divided by movementRatio to determine how much the image will move.
  // A larger movementRatio means the image will be moved less by the same mouse movement.
  // -500 is an arbitrarily large number so that we have a large range (-100~100) of z-index to work with,
  // without getting a movementRatio of 1. movementRatio of 1 moves the image too much.
  const movementRatio = -500 / animatedImage.zIndex;
  return (x: number, y: number) =>
    `translate3d(${x / movementRatio}px,${y / movementRatio}px,0)`;
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
  const [shouldExplode, setShouldExplode] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      console.log('MOVE NOW');
      setShouldExplode(true);
    }, 2000);
  }, [setShouldExplode]);
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
    >
      <animated.div
        className="animate"
        style={{
          transform: props.xy.to(getTransformCallback(textAnimationOptions)),
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
        <StyledMovementWrapper
          shouldExplode={shouldExplode}
          animatedImage={animatedImage}
        >
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
        </StyledMovementWrapper>
      ))}
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
  animation: ${fadeInGrow} 1s forwards;
  animation-delay: 2s;

  ${({ shouldFadeOut }) =>
    shouldFadeOut &&
    css`
      animation: ${fadeOut} 1s forwards;
    `}
`;

const StyledMovementWrapper = styled.div<{
  shouldExplode: boolean;
  animatedImage: AnimatedImage;
}>`
  position: relative;
  transition: transform 1000ms cubic-bezier(0, 0, 0, 1.07);
  ${({ shouldExplode, animatedImage }) =>
    shouldExplode
      ? `transform: translate(${animatedImage.offsetX}px, ${animatedImage.offsetY}px)`
      : `transform: translate(${animatedImage.offsetXStart - 120}px, ${
          animatedImage.offsetYStart - 150
        }px)`};
`;

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
      animation: ${fadeOutGrow} 500ms forwards ${fadeInDelay / 3}ms;
      opacity: 1;
    `}
`;

const StyledBodyText = styled(BodyRegular)`
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;
