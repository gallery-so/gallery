import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import styled from 'styled-components';

type ContentWidthType =
  | 'fullWidth' // fill container
  | 'maxWidth'; // fill up to container

type ContentHeightType = 'maxHeightScreen'; // fill up to screen

type Props = {
  className?: string;
  src: string;
  alt: string;
  widthType?: ContentWidthType;
  heightType?: ContentHeightType;
};

export default function ImageWithLoading({
  className,
  widthType = 'fullWidth',
  heightType,
  src,
  alt,
}: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  return (
    <StyledImg
      className={className}
      widthType={widthType}
      heightType={heightType}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={setContentIsLoaded}
    />
  );
}

type StyledImgProps = {
  widthType: ContentWidthType;
  heightType?: ContentHeightType;
};

const StyledImg = styled.img<StyledImgProps>`
  display: block;
  ${({ widthType }) => (widthType === 'fullWidth' ? 'width' : 'max-width')}: 100%;
  max-height: ${({ heightType }) => (heightType === 'maxHeightScreen' ? '80vh' : '100%')};
`;
