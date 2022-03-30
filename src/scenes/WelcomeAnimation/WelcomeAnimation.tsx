import { useCallback, useEffect, useState } from 'react';
import { BaseM, TitleL } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

import Image from './Image';
import { AnimatedImage, animatedImages } from './Images';

import styled, { css, keyframes } from 'styled-components';
import { animated, useSpring } from 'react-spring';
import { useAuthenticatedUsername } from 'hooks/api/users/useUser';
import { useRouter } from 'next/router';
import useWindowSize from 'src/hooks/useWindowSize';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

const FADE_DURATION = 2000;
// The calc function allows us to control the effect of onMouseMove's x and y movement values on the resulting parallax.
// example usage: https://codesandbox.io/embed/r5x34869vq
const calc = (x: number, y: number) => [(x - window.innerWidth) / 2, (y - window.innerHeight) / 2];

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
  return (x: number, y: number) => `translate3d(${x / movementRatio}px,${y / movementRatio}px,0)`;
}

type Props = {
  next: () => void;
};

type AspectRatio = 'vertical' | 'horizontal' | undefined;

export default function WelcomeAnimation({ next }: Props) {
  const [props, set] = useSpring(() => ({
    xy: [0, 0],
    config: { mass: 10, tension: 550, friction: 140 },
  }));

  // Check for vertical screens and render images in different positions if so
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(undefined);
  const windowSize = useWindowSize();

  useEffect(() => {
    if (windowSize.width / windowSize.height < 1) {
      setAspectRatio('vertical');
      return;
    }

    setAspectRatio('horizontal');
  }, [windowSize]);

  // If we want to use transitions instead of keyframes, we could add a class to each image after X seconds
  // to trigger the transition. Using a transition allows us to not have to add keyframes for each image.

  // const [isTextDisplayed, setIsTextDisplayed] = useState(false);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const [shouldExplode, setShouldExplode] = useState(false);
  const [imagesFaded, setImagesFaded] = useState(false);
  const username = useAuthenticatedUsername();
  const { push } = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setShouldExplode(true);
      setImagesFaded(true);
    }, FADE_DURATION);
  }, [setShouldExplode, setImagesFaded]);

  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Click through welcome page');
    if (username) {
      void push(`/${username}`);
      return;
    }

    // Delay next so we can show a transition animation
    setShouldFadeOut(true);
    setTimeout(() => {
      next();
    }, FADE_DURATION);
  }, [track, username, push, next]);

  return (
    <StyledContainer onMouseMove={({ clientX: x, clientY: y }) => set({ xy: calc(x, y) })}>
      <animated.div
        className="animate"
        style={{
          transform: props.xy.to(getTransformCallback(textAnimationOptions)),
        }}
      >
        <StyledTextContainer shouldFadeOut={shouldFadeOut}>
          <TitleL>Welcome to Gallery</TitleL>
          <Spacer height={8} />
          <StyledBodyText color={colors.gray50}>
            This is your space to share your pieces and the stories that surround them. Curate,
            arrange, and display your collection exactly how it was meant to be.
          </StyledBodyText>
          <Spacer height={16} />
          <StyledButton text="Enter Gallery" onClick={handleClick} />
        </StyledTextContainer>
      </animated.div>
      {animatedImages.map((animatedImage) => (
        <StyledMovementWrapper
          shouldExplode={shouldExplode}
          aspectRatio={aspectRatio}
          animatedImage={animatedImage}
          key={animatedImage.src}
        >
          <animated.div
            className="animate"
            style={{
              transform: props.xy.interpolate(getTransformCallback(animatedImage)),
            }}
          >
            <Image
              width={animatedImage.width}
              src={animatedImage.src ?? ''}
              fadeInDelay={animatedImage.fadeInDelay}
              shouldFadeOut={shouldFadeOut}
              fadeInGrow={fadeInGrow}
              fadeOutGrow={fadeOutGrow}
              imagesFaded={imagesFaded}
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
  animation-delay: ${FADE_DURATION}ms;

  ${({ shouldFadeOut }) =>
    shouldFadeOut &&
    css`
      animation: ${fadeOut} 1s forwards;
    `}
`;

const StyledMovementWrapper = styled.div<{
  shouldExplode: boolean;
  aspectRatio: AspectRatio;
  animatedImage: AnimatedImage;
}>`
  position: relative;
  transition: transform 1000ms cubic-bezier(0, 0, 0, 1.07);

  ${({ shouldExplode, animatedImage, aspectRatio }) =>
    shouldExplode
      ? `transform: translate(${
          aspectRatio === 'vertical' && animatedImage.moveOnVertical
            ? animatedImage.verticalX
            : animatedImage.offsetX
        }px, ${
          aspectRatio === 'vertical' && animatedImage.moveOnVertical
            ? animatedImage.verticalY
            : animatedImage.offsetY
        }px);`
      : `transform: translate(${animatedImage.offsetXStart - 120}px, ${
          animatedImage.offsetYStart - 150
        }px);`}
`;

const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeInGrow} 2s;
  overflow: hidden;
`;

const StyledBodyText = styled(BaseM)`
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;
