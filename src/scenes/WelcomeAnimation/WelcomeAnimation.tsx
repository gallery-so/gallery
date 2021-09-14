import { useCallback, useState, useEffect } from 'react';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

import styled, { css, keyframes } from 'styled-components';
import { useSpring, animated } from 'react-spring';
import './intro.css';
import Mixpanel from 'utils/mixpanel';

// The calc function allows us to control the effect of onMouseMove's x and y movement values on the resulting parallax.
// example usage: https://codesandbox.io/embed/r5x34869vq
const calc = (x: number, y: number) => [
  (x - window.innerWidth) / 2,
  (y - window.innerHeight) / 2,
];
type AnimatedImage = {
  src?: string;
  width: number;
  // ZIndex is the "depth" of image from viewer's pov.
  // It is used to calculate how the image will move based on mousemovement.
  // z-index of 0 is essentially the axis of movement.
  // values can be -100 to 100, with -100 being the furthest from viewer and 100 being closest.
  // positive values move the image in one direction on mouse movement, negative values move in opposite.
  zIndex: number;
  // Offset is the x or y position of the image after the explosion and they fan out
  offsetX: number;
  offsetY: number;
  // Offset start is the x or y position of the image when they first load in
  offsetXStart: number;
  offsetYStart: number;
  // Delay in ms so that images don't all appear at once
  fadeInDelay: number;
};

const animatedImages: AnimatedImage[] = [
  {
    src:
      'https://lh3.googleusercontent.com/AqK0M5EcGCytypy6t5VBclg2Pm66npq4Qpf-MlNox_l1BD8uhDhlircZ5mPCrKch3FAgacTbRO61Ur722W3g-ANWiTMQU6owrnOukQ', // Chair
    width: 180,
    zIndex: -40,
    offsetX: 180,
    offsetY: -370,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 800,
  },
  {
    src:
      'https://lh3.googleusercontent.com/sxCl9E-dvfOq7UidBi-dO8TDXtU7QmbpVj8x4nXnJpDAujj2c74F1cTqvX5alvInLh9NkaoGFL1aFIvx8M2mRtqQ', // Punk
    width: 100,
    zIndex: -13,
    offsetX: -105,
    offsetY: 210,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 0,
  },
  {
    src: 'https://lh3.googleusercontent.com/Y1IJvZJcWZgtA0YtcLz6gBV4EMA4AkK9s4_qWqMYAly-DOg7c_uGvSEO6gUH0T3Y31g-Ohs4_6vnxMjwD-azlve_7e9awUtQZrduFQ', // Neoclassicism
    width: 280,
    zIndex: -18,
    offsetX: 370,
    offsetY: 100,
    offsetXStart: -20,
    offsetYStart: -12,
    fadeInDelay: 300,
  },
  {
    src:
      'https://lh3.googleusercontent.com/urYlsZ_9-L407WLT2KC4nTuQtf8iurO09_C4fxve2pZxSKW43npPF9yLCSvbMw9nnZjr8Hegz8HVi413lYUPKXq-8WeEApcxzOWU', // Squiggle
    width: 200,
    zIndex: 20,
    offsetX: -150,
    offsetY: -390,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 0,
  },
  {
    src: 'https://lh3.googleusercontent.com/rYPQCDn8RIgPafTpnXCtRmmDnBt1jv1FloRNFuRd8XgHha0YAYx-UuFvAhlejHOha3USJORnJnejXZgaFtzX-zUnRtGb8fOB8YWq4w', // Sampler
    width: 200,
    zIndex: 11,
    offsetX: -550,
    offsetY: -340,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 1200,
  },
  {
    src:
      'https://lh3.googleusercontent.com/G6eilbjTdOHxUcZC3y_O96beaUu_DGzyiduK3HB_7ki94QuZx02xQSz4S-KaDIg-Pw-0YkV1KgC3ECmflEzWq0HoZw', // Venus
    width: 250,
    zIndex: 37,
    offsetX: -490,
    offsetY: 110,
    offsetXStart: 0,
    offsetYStart: 30,
    fadeInDelay: 500,
  },
  {
    src:
      'https://lh3.googleusercontent.com/eseF_p4TBPq0Jauf99fkm32n13Xde_Zgsjdfy6L450YZaEUorYtDmUUHBxcxnC21Sq8mzBJ6uW8uUwYCKckyChysBRNvrWyZ6uSx', // Doge
    width: 220,
    zIndex: 25,
    offsetX: 440,
    offsetY: -240,
    offsetXStart: -40,
    offsetYStart: 0,
    fadeInDelay: 0,
  },
  {
    src: 'https://lh3.googleusercontent.com/Ttouv6tE3d4HavomW-N1cq2SPObKtiYrKtO8iZBBI-_dlsqFkiA9lmMOpCY4FFTG4hbnIGBsL9WDAaSDPfYLo8Xt4WJu74QTCkyQJIU', // Pink
    width: 200,
    zIndex: 30,
    offsetX: 80,
    offsetY: 150,
    offsetXStart: 0,
    offsetYStart: -40,
    fadeInDelay: 300,
  },
  {
    src: 'https://ipfs.io/ipfs/QmUttDiQH3utkd5Zcq5J9QjCfpoWXTdYprobcJts22cpxc/1_Satoshiscoin_Gif.gif', // Satoshis Coin
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

export default function WelcomeAnimation({ next }: Props) {
  const [props, set] = useSpring(() => ({
    xy: [0, 0],
    config: { mass: 10, tension: 550, friction: 140 },
  }));

  // If we want to use transitions instead of keyframes, we could add a class to each image after X seconds
  // to trigger the transition. Using a transition allows us to not have to add keyframes for each image.

  // const [isTextDisplayed, setIsTextDisplayed] = useState(false);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const [shouldExplode, setShouldExplode] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShouldExplode(true);
    }, 2000);
  }, [setShouldExplode]);
  const handleClick = useCallback(() => {
    // Delay next so we can show a transition animation
    Mixpanel.track('Click through welcome page');
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
      {animatedImages.map(animatedImage => (
        <StyledMovementWrapper
          shouldExplode={shouldExplode}
          animatedImage={animatedImage}
        >
          <animated.div
            className="animate"
            style={{
              transform: props.xy.interpolate(
                getTransformCallback(animatedImage),
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
    shouldFadeOut
    && css`
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
    shouldFadeOut
    && css`
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
