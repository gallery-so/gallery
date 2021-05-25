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

import Tilt from 'react-parallax-tilt';
import { useEffect } from 'react';

// const parallax = function (e: MouseEvent) {
//   console.log(e.clientX, e.clientY);
// };

const calc = (x: number, y: number) => [
  x - window.innerWidth / 2,
  y - window.innerHeight / 2,
];
const trans1 = (x: number, y: number) =>
  `translate3d(${x / 10}px,${y / 10}px,0)`;
const trans2 = (x: number, y: number) =>
  `translate3d(${x / 8 + 35}px,${y / 8 - 230}px,0)`;
const trans3 = (x: number, y: number) =>
  `translate3d(${x / 6 - 250}px,${y / 6 - 200}px,0)`;
const trans4 = (x: number, y: number) =>
  `translate3d(${x / 3.5}px,${y / 3.5}px,0)`;
const trans5 = (x: number, y: number) =>
  `translate3d(${x / 7 - 45}px,${y / 7 - 50}px,0)`;
const trans6 = (x: number, y: number) =>
  `translate3d(${-x / 2 + 10}px,${-y / 2 + 3.5}px,0)`;

export default function CoolIntro(_: RouteComponentProps) {
  // useEffect(() => {
  //   document.addEventListener('mousemove', parallax);
  //   return () => document.removeEventListener('mousemove', parallax);
  // }, []);
  const [props, set] = useSpring(() => ({
    xy: [0, 0],
    config: { mass: 10, tension: 550, friction: 140 },
  }));
  return (
    <StyledContainer
      // className="container"
      onMouseMove={({ clientX: x, clientY: y }) => set({ xy: calc(x, y) })}
    >
      {/* <_Animate> */}
      <animated.div
        className="card1"
        style={{ transform: props.xy.interpolate(trans1) }}
      >
        <Image width={200} src={Pic1} />
      </animated.div>
      <animated.div
        className="card2"
        style={{ transform: props.xy.interpolate(trans2) }}
      >
        <Image width={200} src={Pic2} />
      </animated.div>
      <animated.div
        className="card3"
        style={{ transform: props.xy.interpolate(trans3) }}
      >
        <Image width={200} src={Pic3} />
      </animated.div>
      <animated.div
        className="card4"
        style={{ transform: props.xy.interpolate(trans4) }}
      >
        <Image width={200} src={Pic4} />
      </animated.div>
      <animated.div
        className="card4"
        style={{ transform: props.xy.interpolate(trans5) }}
      >
        <Image width={200} src={Pic4} />
      </animated.div>
      <animated.div
        className="card4"
        style={{ transform: props.xy.interpolate(trans6) }}
      >
        <Image width={200} src={Pic4} />
      </animated.div>
      {/* </_Animate> */}
    </StyledContainer>
    // comment this out if you don't want tilt
    // demo: https://www.npmjs.com/package/react-parallax-tilt
    // <Tilt perspective={2000}>
    // <Container>
    //   <_Position x={-550} y={-200}>
    //     <_Animate>
    //       <Image width={200} src={Pic1} />
    //     </_Animate>
    //   </_Position>

    //   <_Position x={-500} y={200}>
    //     <_Animate>
    //       <Image width={200} src={Pic2} />
    //     </_Animate>
    //   </_Position>

    //   <_Position x={-225} y={20}>
    //     <_Animate>
    //       <Image width={200} src={Pic3} />
    //     </_Animate>
    //   </_Position>

    //   <_Position x={-150} y={-300}>
    //     <_Animate>
    //       <Image width={150} src={Pic4} />
    //     </_Animate>
    //   </_Position>

    //   <_Position x={0} y={300}>
    //     <_Animate>
    //       <Image width={150} src={Pic5} />
    //     </_Animate>
    //   </_Position>

    //   <_Position x={150} y={-200}>
    //     <_Animate>
    //       <Image width={250} src={Pic8} />
    //     </_Animate>
    //   </_Position>

    //   <_Position x={300} y={125}>
    //     <_Animate>
    //       <Image width={200} src={Pic12} />
    //     </_Animate>
    //   </_Position>

    //   <_Position x={550} y={-175}>
    //     <_Animate>
    //       <Image width={200} src={Pic7} />
    //     </_Animate>
    //   </_Position>

    //   <_Position x={550} y={300}>
    //     <_Animate>
    //       <Image width={100} src={Pic9} />
    //     </_Animate>
    //   </_Position>
    // </Container>
    // </Tilt>
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

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;

  position: relative;
`;

const _Position = styled.div<{ x: number; y: number }>`
  position: absolute;
  transform: ${({ x, y }) => `translate(${x}px, ${y}px)`};
`;

const _Animate = styled.div`
  animation: ${fadeIn} 2s;
  // position: absolute;
`;

const Image = styled.img<{ width: number }>`
  width: ${({ width }) => width}px;
`;
