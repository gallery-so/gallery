import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

type Props = {
  src: string;
  alt: string;
  width?: number;
  onLoadComplete?: () => void;
  onLoadError?: () => void;
};

export default function ImageWithShimmer({
  src,
  alt,
  width,
  onLoadComplete,
  onLoadError,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  // TODO: display a fallback if image fails to load
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      setTimeout(() => {
        setLoaded(true);
        onLoadComplete?.();
      }, 1000);
    };
    image.onerror = () => {
      setErrored(true);
      onLoadError?.();
    };
  }, [onLoadComplete, onLoadError, src]);

  return (
    <StyledImageWithShimmer width={width}>
      {loaded ? <StyledImg src={src} alt={alt} /> : <Shimmer />}
    </StyledImageWithShimmer>
  );
}

const StyledImageWithShimmer = styled.div<{ width?: number }>`
  position: relative;
  width: ${({ width }) => (width ? width : '100%')};
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
  width: 100%;

  aspect-ratio: 1;
  /* hack for safari, since it doesn't support aspect-ratio yet */
  padding-top: 100%;

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

const StyledImg = styled.img`
  display: block;
  width: 100%;
`;
