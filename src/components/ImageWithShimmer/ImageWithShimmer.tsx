import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export default function ImageWithShimmer({ src, alt, width, height }: Props) {
  const [loaded, setLoaded] = useState(false);
  // TODO: display a fallback if image fails to load
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      setTimeout(() => {
        console.log('loaded');
        setLoaded(true);
      }, 2000);
    };
    image.onerror = () => setErrored(true);
  }, [src]);

  return (
    <StyledImageWithShimmer loaded={loaded} width={width}>
      {!loaded && <Shimmer />}
      {loaded && <StyledImg src={src} alt={alt} width={width} />}
    </StyledImageWithShimmer>
  );
}

const StyledImageWithShimmer = styled.div<{
  loaded: boolean;
  width?: number;
}>`
  position: relative;
  width: ${({ width }) => width}px;
  height: ${({ loaded, width }) => (loaded ? 'inherit' : `${width}px`)};
`;

const loading = keyframes`
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
`;

const Shimmer = styled.div`
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  background-image: linear-gradient(270deg, #fafafa, #eaeaea, #eaeaea, #fafafa);
  /* shimmer with cool colors
  background-image: linear-gradient(
    270deg,
    #c1e1ff,
    #fbc7f0,
    #d6fbc7,
    #c1e1ff
  ); */
  background-size: 400% 100%;
  animation: ${loading} 6s cubic-bezier(0, 0.38, 0.58, 1) infinite;
`;

const StyledImg = styled.img<{ width?: number }>`
  width: ${({ width }) => (width ? `${width}px` : 'inherit')};
`;
