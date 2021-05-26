/**
 * TODO__v1: This file should be moved to the onboarding flow
 */
import { RouteComponentProps } from '@reach/router';
import styled, { keyframes } from 'styled-components';
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

const calc = (x: number, y: number) => [
  x - window.innerWidth / 2,
  y - window.innerHeight / 2,
];
type animatedImage = {
  src: string;
  width?: number;
  // zIndex is the "depth" of image from viewer's pov.
  // It is used to calculate how the image will move based on mousemovement.
  // z-index of 0 is essentially the axis of movement. positive values move in one direction, negative values move in opposite.
  // values can be -100 to 100, with -100 being the furthest from viewer and 100 being closest.
  zIndex: number;
  offsetX: number;
  offsetY: number;
};

const animatedImages: animatedImage[] = [
  {
    src: Pic8, //chair
    width: 180,
    zIndex: -70,
    offsetX: 220,
    offsetY: -240,
  },
  {
    src: Pic3, // pray
    width: 230,
    zIndex: -21,
    offsetX: -210,
    offsetY: -30,
  },
  {
    src: Pic6, //punk
    width: 100,
    zIndex: -13,
    offsetX: -5,
    offsetY: 300,
  },
  {
    src: Pic11, //statue
    width: 280,
    zIndex: 48,
    offsetX: 470,
    offsetY: 280,
  },
  {
    src: Pic4, //squiggly
    width: 200,
    zIndex: 50,
    offsetX: -150,
    offsetY: -300,
  },
  {
    src: Pic1, //controller
    width: 200,
    zIndex: 31,
    offsetX: -550,
    offsetY: -200,
  },
  {
    src: Pic13, //car
    width: 250,
    zIndex: 77,
    offsetX: -500,
    offsetY: 230,
  },
  {
    src: Pic7, // trippy
    width: 220,
    zIndex: 25,
    offsetX: 500,
    offsetY: -100,
  },
  {
    src: Pic12, //billow
    width: 200,
    zIndex: 50,
    offsetX: 130,
    offsetY: 80,
  },
];

function getTransformCallback(animatedImage: animatedImage) {
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

export default function CoolIntro(_: RouteComponentProps) {
  const [props, set] = useSpring(() => ({
    xy: [0, 0],
    config: { mass: 10, tension: 550, friction: 140 },
  }));
  return (
    <StyledContainer
      onMouseMove={({ clientX: x, clientY: y }) => set({ xy: calc(x, y) })}
    >
      {animatedImages.map((animatedImage) => (
        <animated.div
          className="animate"
          style={{
            transform: props.xy.interpolate(
              getTransformCallback(animatedImage)
            ),
          }}
        >
          <Image width={animatedImage.width} src={animatedImage.src} />
        </animated.div>
      ))}
    </StyledContainer>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); };
  to { opacity: 1; transform: scale(1.0); };
`;
const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 2s;
`;

const Image = styled.img<{ width?: number }>`
  ${({ width }) => width && `width: ${width}px;`}
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
`;
