import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import styled from 'styled-components';

type Props = {
  className?: string;
  src: string;
  alt: string;
  width?: number;
};

export default function ImageWithLoading({ className, src, alt }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  return <StyledImg className={className} src={src} alt={alt} onLoad={setContentIsLoaded}/>;
}

const StyledImg = styled.img`
  display: block;
  width: 100%;
`;
