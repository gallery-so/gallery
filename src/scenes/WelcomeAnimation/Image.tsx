import styled, { css, Keyframes } from 'styled-components';
import { useState, useRef, useCallback } from 'react';
import { animated, useSpring } from 'react-spring';

type Props = {
  src: string;
  width: number;
  fadeInDelay: number;
  shouldFadeOut: boolean;
  imagesFaded: boolean;
  fadeInGrow: Keyframes;
  fadeOutGrow: Keyframes;
};

const StyledImage = styled.img<{
  width?: number;
  fadeInDelay: number;
  fadeInGrow?: Keyframes;
  fadeOutGrow?: Keyframes;
  shouldFadeOut?: boolean;
  imagesFaded?: boolean;
}>`
  width: ${({ width }) => width}px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
  opacity: 1;

  /*  We only want to apply the animation to fade in the images, and then we can remove the animation
   We need to remove animation property once faded in, so that transform can be modified in hover events */
  ${({ imagesFaded, fadeInGrow, fadeInDelay }) =>
    !imagesFaded &&
    css`
      animation: ${fadeInGrow} 1000ms forwards ${fadeInDelay} ms;
    `}

  ${({ shouldFadeOut, fadeInDelay, fadeOutGrow }) =>
    shouldFadeOut &&
    css`
      animation: ${fadeOutGrow} 500ms forwards ${fadeInDelay}ms;
      opacity: 0;
    `};
`;

function calc(
  x: number,
  y: number,
  rect: { top: number; left: number; width: number; height: number }
): number[] {
  const rotationCeiling = 5; // Maximum degrees to rotate on both axes

  // Do not let xRotation or yRotation go over the ceiling
  const yRotationUnscaled = (y - rect.top - rect.height / 2) / 10;
  const xRotationUnscaled = (x - rect.left - rect.width / 2) / 10;

  const ceiling = function (rotation: number): number {
    return rotation < 0
      ? Math.max(rotation, rotationCeiling * -1)
      : Math.min(rotation, rotationCeiling);
  };

  return [ceiling(yRotationUnscaled) * -1, ceiling(xRotationUnscaled), 1.05];
}

const trans = (x: number, y: number, s: number): string =>
  `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

const config = {
  mass: 1,
  tension: 170,
  friction: 75,
  clamp: false,
  precision: 0.01,
  velocity: 0,
};

function Image({
  width,
  src,
  fadeInDelay,
  shouldFadeOut,
  fadeInGrow,
  fadeOutGrow,
  imagesFaded,
}: Props) {
  const [xys, setXys] = useState([0, 0, 1]);

  const handleMouseLeave = useCallback(() => {
    setXys([0, 0, 1]);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setXys(calc(e.clientX, e.clientY, rect));
    }
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const props = useSpring({ xys, config });

  return (
    <div
      className="hover-listener"
      ref={ref}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <animated.div className="rotatable" style={{ transform: props.xys.to(trans) }}>
        <StyledImage
          src={src}
          width={width}
          shouldFadeOut={shouldFadeOut}
          fadeInDelay={fadeInDelay}
          fadeInGrow={fadeInGrow}
          fadeOutGrow={fadeOutGrow}
          imagesFaded={imagesFaded}
        />
      </animated.div>
    </div>
  );
}

export default Image;
