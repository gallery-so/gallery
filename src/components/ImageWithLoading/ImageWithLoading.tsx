import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import styled from 'styled-components';
import { ImageSrcSet } from 'utils/imageSrcSet';

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
  srcSet: ImageSrcSet['srcSet'];
};

export default function ImageWithLoading({
  className,
  widthType = 'fullWidth',
  heightType,
  src,
  alt,
  srcSet,
}: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  if (srcSet) {
    return (
      <StyledImg
        className={className}
        widthType={widthType}
        heightType={heightType}
        src={src}
        srcSet={srcSet}
        alt={alt}
        loading="lazy"
        onLoad={setContentIsLoaded}
      />
    );
  }

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
  max-height: ${({ heightType }) =>
    heightType === 'maxHeightScreen' ? 'min(100%, 80vh)' : '100%'};
`;
