import Button from 'components/core/Button/Button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

// TODOs
// DONE fade in/out
// random duration
// random position
// DONE random start point of animation (negative animation-delay ?)
// random number of clusters
// DONE random position of clusters

// inpractice, triggering the animation will probably use a context?
// then any component can trigger the animation
export default function AnimationTest() {
  const [showStars, setShowStars] = useState(false);
  // const [startFadeOut, setStartFadeout] = useState(false);
  const handleClick = useCallback(() => {
    console.log('clicked');
    setShowStars(true);
    // setTimeout(() => {
    //   setStartFadeout(true);
    // }, 1800);
    setTimeout(() => {
      setShowStars(false);
    }, 2000);
  }, []);
  return (
    <>
      <Button text="animate" onClick={handleClick} />
      <StyledAnimationWrapper>
        {showStars && (
          <>
            <Cluster index={0} />
            <Cluster index={1} />
            <Cluster index={2} />
            <Cluster index={3} />
            <Cluster index={4} />
          </>
        )}
      </StyledAnimationWrapper>
    </>
  );
}

const StyledAnimationWrapper = styled.div``;

//////////
// STAR //
//////////

// random animation duration between 0.5 and 1 seconds
function getRandomDuration() {
  return Math.random() * 0.5 + 0.5;
}

// random size between baseSize~40px
function getRandomSize(baseSize: number) {
  return Math.random() * 10 + baseSize;
}

// random animation duration between 0 and 1 seconds
// to offset animation to be more organic
function getRandomDelay() {
  return Math.random() * 1;
}

// Cluster position
// random position between 10 and 90 percent of the screen
function getRandomPosition(index: number) {
  return Math.random() * (80 / 4) * (index + 1) + 10;
}

const STAR_BASE_SIZE_BIG = 50;
const STAR_BASE_SIZE_SMALL = 35;

type ClusterType = {
  index: number;
};

function Cluster({ index }: ClusterType) {
  const [startFadeOut, setStartFadeout] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setStartFadeout(true);
    }, 1500);
  }, []);

  const clusterAnimationParams = useMemo(() => {
    return {
      positionX: getRandomPosition(index),
      positionY: getRandomPosition(index),
    };
  }, [index]);

  const starAnimationParams = useMemo(() => {
    const durationA = getRandomDuration();
    const delay = getRandomDelay();
    return [
      {
        time: durationA,
        delay: getRandomDelay(),
        size: getRandomSize(STAR_BASE_SIZE_BIG),
      },
      {
        time: getRandomDuration(),
        delay: delay + durationA,
        size: getRandomSize(STAR_BASE_SIZE_SMALL),
      },
    ];
  }, []);

  console.log('starAnimationParams', starAnimationParams);

  return (
    <StyledStarsWrapper
      startFadeOut={startFadeOut}
      positionX={clusterAnimationParams.positionX}
      positionY={clusterAnimationParams.positionY}
    >
      {starAnimationParams.map((params) => (
        <Star key={params.time} time={params.time} delay={params.delay} size={params.size} />
      ))}
    </StyledStarsWrapper>
  );
}

const resize = keyframes`
0% {
  transform: scale(0.2);
}
50% {
  transform: scale(1.0);
}
100% {
  transform: scale(0.2);
}
`;
const fadeIn = keyframes`
  from { opacity: 0; };
  to { opacity: 1; };
`;
const fadeOut = keyframes`
  from { opacity: 1; };
  to { opacity: 0; };
`;

type WrapperProps = {
  startFadeOut?: boolean;
  positionX?: number;
  positionY?: number;
};

const StyledStarsWrapper = styled.div<WrapperProps>`
  position: absolute;
  z-index: 1000;
  top: ${({ positionY }) => positionY}vh;
  left: ${({ positionX }) => positionX}vw;
  animation: ${fadeIn} 0.5s forwards;

  ${({ startFadeOut }) =>
    startFadeOut &&
    css`
      animation: ${fadeOut} 0.5s forwards;
    `}
`;

type StarProps = {
  time: number;
  size: number;
  delay: number;
};

const Star = styled.div<StarProps>`
  ${({ size }) => `
  height: ${size}px;
  width: ${size}px;
    `}
  background: center / contain no-repeat scroll url(/icons/star.svg);
  ${({ time }) => css`
    animation: ${resize} ${time}s ease-in-out infinite;
  `}

  animation-delay: -${({ delay }) => delay}s;
`;
