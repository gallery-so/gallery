import { useEffect, useRef, useState } from 'react';
import { animated, SpringValue, useSpring } from 'react-spring';
import colors from 'shared/theme/colors';
import styled, { keyframes } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed } from '~/components/core/Text/Text';
import { SignInButton } from '~/contexts/globalLayout/GlobalNavbar/SignInButton';
import { SignUpButton } from '~/contexts/globalLayout/GlobalNavbar/SignUpButton';
import useWindowSize from '~/hooks/useWindowSize';

import Image from '../WelcomeAnimation/Image';
import { AnimatedImage } from '../WelcomeAnimation/Images';
import { animatedImages } from './LandingCoverAnimationImages';

type AspectRatio = 'vertical' | 'horizontal' | undefined;
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

export default function LandingCoverAnimation() {
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

  return (
    <StyledContainer onMouseMove={({ clientX: x, clientY: y }) => set({ xy: calc(x, y) })}>
      <animated.div
        className="animate"
        style={{
          transform: props.xy.to(getTransformCallback(textAnimationOptions)),
        }}
      >
        <VStack align="center" gap={80}>
          <StyledTitle>
            Gallery is the easiest way to express yourself <em>onchain</em>
          </StyledTitle>
          <HStack gap={12}>
            <StyledSignInButton size="lg" />
            <SignUpButton size="lg" />
          </HStack>
        </VStack>
        {/* <StyledTextContainer shouldFadeOut={shouldFadeOut} gap={16}>
          <VStack gap={8} align="center">
            <TitleL>Welcome to Gallery</TitleL>
            <StyledBodyText>
              This is your space to share your pieces and the stories that surround them. Curate,
              arrange, and display your collection exactly how it was meant to be.
            </StyledBodyText>
          </VStack>
          <StyledButton
            // onboarding steps are instrumented elsewhere
            eventElementId={null}
            eventName={null}
            eventContext={null}
            onClick={handleClick}
          >
            Enter Gallery
          </StyledButton>
        </StyledTextContainer> */}
      </animated.div>
      {animatedImages.map((animatedImage) => (
        <AnimatedImage
          animatedImage={animatedImage}
          key={animatedImage.src}
          aspectRatio={aspectRatio}
          xy={props.xy}
        />
      ))}
    </StyledContainer>
  );
}

function AnimatedImage({
  animatedImage,
  aspectRatio,
  xy,
}: {
  animatedImage: AnimatedImage;
  aspectRatio: AspectRatio;
  xy: SpringValue<number[]>;
}) {
  const divRef = useRef(null); // Reference to your div

  const updateOpacity = () => {
    if (divRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      console.log(rect.bottom, windowHeight);

      // if (rect.top > 100 || rect.top < 0) {
      //   return;
      // }

      // Calculate opacity based on the div's position relative to the viewport
      const opacity = Math.max(0, Math.min(1, (rect.top + 100) / 200));

      // Apply the opacity to the div
      divRef.current.style.opacity = opacity;
    }
  };

  useEffect(() => {
    // Function to handle scroll and resize events
    const handleScrollAndResize = () => {
      updateOpacity();
    };

    // Add event listeners for scroll and resize
    window.addEventListener('scroll', handleScrollAndResize);
    window.addEventListener('resize', handleScrollAndResize);

    // Initial update for opacity
    updateOpacity();

    return () => {
      // Cleanup event listeners
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, []);

  return (
    <StyledMovementWrapper animatedImage={animatedImage} aspectRatio={aspectRatio}>
      <animated.div
        className="animate"
        style={{
          transform: xy.interpolate(getTransformCallback(animatedImage)),
        }}
      >
        <div ref={divRef}>
          <Image
            alt="Welcome to Gallery"
            width={animatedImage.width}
            src={animatedImage.src ?? ''}
            fadeInDelay={animatedImage.fadeInDelay}
            shouldFadeOut={false}
            fadeInGrow={fadeInGrow}
            fadeOutGrow={fadeOutGrow}
            imagesFaded={false}
          />
        </div>
      </animated.div>
    </StyledMovementWrapper>
  );
}

const StyledTitle = styled(TitleCondensed)`
  font-size: 56px;
  line-height: 48px;
  margin: 0 20px;
  font-weight: 300;

  @media only screen and ${breakpoints.tablet} {
    width: 60%;
    margin: auto;
    font-size: 96px;
    line-height: 84px;
  }
`;

const fadeInGrow = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.0); }
`;

const fadeOutGrow = keyframes`
  from { opacity: 1; transform: scale(1.0); }
  to { opacity: 0; transform: scale(1.8); }
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

const StyledMovementWrapper = styled.div<{
  animatedImage: AnimatedImage;
  aspectRatio: AspectRatio;
}>`
  position: relative;
  transition: transform 1000ms cubic-bezier(0, 0, 0, 1.07);

  ${({ animatedImage, aspectRatio }) =>
    `transform: translate(${
      aspectRatio === 'vertical' && animatedImage.moveOnVertical
        ? animatedImage.verticalX
        : animatedImage.offsetX
    }px, ${
      aspectRatio === 'vertical' && animatedImage.moveOnVertical
        ? animatedImage.verticalY
        : animatedImage.offsetY
    }px);`}
`;

const StyledSignInButton = styled(SignInButton)`
  border: 1px solid ${colors.black['800']};
`;
