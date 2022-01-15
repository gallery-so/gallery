import styled, { css, Keyframes } from 'styled-components';
import { useState } from 'react';

type Props = {
  src: string;
  width: number;
  fadeInDelay: number;
  shouldFadeOut: boolean;
  imagesFaded: boolean;
  fadeInGrow: Keyframes;
  fadeOutGrow: Keyframes;
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
  const [xRotation, setXRotation] = useState(0);
  const [yRotation, setYRotation] = useState(0);

  const StyledImage = styled.img<{
    width?: number;
    fadeInDelay: number;
    shouldFadeOut?: boolean;
  }>`
    width: ${({ width }) => width}px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
    opacity: 1;

    transform-style: preserve-3d;

    /* After creating <Image />, the fade in animation ran twice (once on load and once on explosion) This prevents that and only applies fade animation if images have not already faded in */
    animation: ${imagesFaded ? null : fadeInGrow} 1000ms forwards ${fadeInDelay}ms;

    ${({ shouldFadeOut, fadeInDelay }) =>
      shouldFadeOut &&
      css`
        animation: ${fadeOutGrow} 500ms forwards ${fadeInDelay}ms;
        opacity: 0;
      `};
  `;

  return (
    <div
      className="hover-listener"
      onMouseMove={(e) => {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        const width = e.target.width;
        const height = e.target.height;

        const MAX_X_ROTATION = 10;
        const MAX_Y_ROTATION = 10;

        const xDistance = (Math.abs(x - width / 2) / (width / 2)) * (x < width / 2 ? -1 : 1);
        const yDistance = (Math.abs(y - height / 2) / (height / 2)) * (y < height / 2 ? 1 : -1);

        setXRotation(xDistance * MAX_X_ROTATION);
        setYRotation(yDistance * MAX_Y_ROTATION);
      }}
      onMouseLeave={() => {
        setXRotation(0);
        setYRotation(0);
      }}
    >
      <StyledImage
        style={{ transform: `rotateX(${yRotation}deg) rotateY(${xRotation}deg) scale3d(1, 1, 1)` }}
        src={src}
        width={width}
        className="rotatable"
        shouldFadeOut={shouldFadeOut}
        fadeInDelay={fadeInDelay}
      />
    </div>
  );
}

export default Image;
