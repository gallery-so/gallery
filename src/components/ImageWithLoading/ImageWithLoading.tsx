import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import styled from 'styled-components';

type Props = {
  src: string;
  alt: string;
  width?: number;
};

export default function ImageWithLoading({ src, alt }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  return <StyledImg src={src} alt={alt} onLoad={setContentIsLoaded}/>;
}

const StyledImg = styled.img`
  display: block;
  width: 100%;
`;
