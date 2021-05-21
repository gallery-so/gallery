import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';

type Props = {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
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
        setLoaded(true);
      }, 1000);
    };
    image.onerror = () => setErrored(true);
  }, [src]);

  const widthStyle = useMemo(() => {
    return typeof width === 'string' ? width : `${width}px`;
  }, [width]);

  return (
    <StyledImageWithShimmer loaded={loaded} widthStyle={widthStyle}>
      {!loaded && <Shimmer />}
      {loaded && <StyledImg src={src} alt={alt} widthStyle={widthStyle} />}
    </StyledImageWithShimmer>
  );
}

const StyledImageWithShimmer = styled.div<{
  loaded: boolean;
  widthStyle: string;
}>`
  position: relative;
  width: ${({ widthStyle }) => widthStyle};
  height: ${({ loaded, widthStyle }) => (loaded ? undefined : widthStyle)};
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

const StyledImg = styled.img<{ widthStyle: string }>`
  display: block;
  width: ${({ widthStyle }) => (widthStyle ? widthStyle : 'inherit')};
`;
