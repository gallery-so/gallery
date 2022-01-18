import styled, { css, Keyframes } from 'styled-components';
import { useState, useRef } from 'react';
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

const calc = (
  x: number,
  y: number,
  rect: { top: number; left: number; width: number; height: number }
): number[] => [-(y - rect.top - rect.height / 2) / 8, (x - rect.left - rect.width / 2) / 8, 1.05];
const trans = (x: number, y: number, s: number): string =>
  `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

function Image({
  width,
  src,
  fadeInDelay,
  shouldFadeOut,
  fadeInGrow,
  fadeOutGrow,
  imagesFaded,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [xys, set] = useState([0, 0, 1]);
  const config = {
    mass: 1,
    tension: 170,
    friction: 75,
    clamp: false,
    precision: 0.01,
    velocity: 0,
  };
  const props = useSpring({ xys, config });

  return (
    <div
      className="hover-listener"
      ref={ref}
      onMouseLeave={() => {
        set([0, 0, 1]);
      }}
      onMouseMove={(e) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          set(calc(e.clientX, e.clientY, rect));
        }
      }}
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
