/**
 * TODO__v1: This file should be moved to the onboarding flow
 */
import { RouteComponentProps } from '@reach/router';
import styled, { keyframes } from 'styled-components';

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

export default function CoolIntro(_: RouteComponentProps) {
  return (
    // comment this out if you don't want tilt
    // demo: https://www.npmjs.com/package/react-parallax-tilt
    <Tilt perspective={2000}>
      <Container>
        <_Position x={-550} y={-200}>
          <_Animate>
            <Image width={200} src={Pic1} />
          </_Animate>
        </_Position>

        <_Position x={-500} y={200}>
          <_Animate>
            <Image width={200} src={Pic2} />
          </_Animate>
        </_Position>

        <_Position x={-225} y={20}>
          <_Animate>
            <Image width={200} src={Pic3} />
          </_Animate>
        </_Position>

        <_Position x={-150} y={-300}>
          <_Animate>
            <Image width={150} src={Pic4} />
          </_Animate>
        </_Position>

        <_Position x={0} y={300}>
          <_Animate>
            <Image width={150} src={Pic5} />
          </_Animate>
        </_Position>

        <_Position x={150} y={-200}>
          <_Animate>
            <Image width={250} src={Pic8} />
          </_Animate>
        </_Position>

        <_Position x={300} y={125}>
          <_Animate>
            <Image width={200} src={Pic12} />
          </_Animate>
        </_Position>

        <_Position x={550} y={-175}>
          <_Animate>
            <Image width={200} src={Pic7} />
          </_Animate>
        </_Position>

        <_Position x={550} y={300}>
          <_Animate>
            <Image width={100} src={Pic9} />
          </_Animate>
        </_Position>
      </Container>
    </Tilt>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;

  position: relative;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); };
  to { opacity: 1; transform: scale(1.0); };
`;

const _Position = styled.div<{ x: number; y: number }>`
  position: absolute;
  transform: ${({ x, y }) => `translate(${x}px, ${y}px)`};
`;

const _Animate = styled.div`
  animation: ${fadeIn} 2s;
`;

const Image = styled.img<{ width: number }>`
  width: ${({ width }) => width}px;
`;
