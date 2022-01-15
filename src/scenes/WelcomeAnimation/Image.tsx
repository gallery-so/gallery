import styled, { css, Keyframes } from 'styled-components';

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
  const StyledImage = styled.img<{
    width?: number;
    fadeInDelay: number;
    shouldFadeOut?: boolean;
  }>`
    width: ${({ width }) => width}px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
    opacity: 1;

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
    <StyledImage
      src={src}
      width={width}
      className="rotatable"
      shouldFadeOut={shouldFadeOut}
      fadeInDelay={fadeInDelay}
    />
  );
}

export default Image;
