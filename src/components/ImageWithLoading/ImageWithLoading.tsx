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

  // The below has visual effects on image assets w/o notes as well, see https://gallery.so/mikey/20pejlO8YtjuR6X7efR7bCSrdzK/20peWZgskhYcCasuCk0z6P3VCN1
  // It is needed to force images to fit in container and prevent overlap with note
  height: 100%;
`;
