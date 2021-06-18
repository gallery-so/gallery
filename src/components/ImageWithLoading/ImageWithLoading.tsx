import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useEffect } from 'react';
import styled from 'styled-components';

type Props = {
  src: string;
  alt: string;
  width?: number;
};

export default function ImageWithLoading({ src, alt }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      setTimeout(() => {
        setContentIsLoaded();
      }, 1000);
    };
    image.onerror = () => {
      // TODO: add handling loading error on shimmer context
      // setErrored(true);
    };
  }, [setContentIsLoaded, src]);

  return <StyledImg src={src} alt={alt} />;
}

const StyledImg = styled.img`
  display: block;
  width: 100%;
`;
