import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useMemo } from 'react';
import styled from 'styled-components';

type ContentWidthType = 'fullWidth' | 'maxWidth';

type ContentHeightType =
  | 'maxHeightMinScreen' // fill up to 80vh of screen or 100% of container
  | 'maxHeightScreen' // fill up to 80vh of screen
  | 'inherit';

type Props = {
  className?: string;
  src: string;
  alt: string;
  widthType?: ContentWidthType;
  heightType?: ContentHeightType;
};

export default function ImageWithLoading({
  className,
  widthType = 'maxWidth',
  heightType,
  src,
  alt,
}: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  const maxHeight = useMemo(() => {
    // TODO: for some reason, the part of the 100% max height is not enforced
    // for NftPreviewImages on the User Gallery Page. as a result, there's a
    // separate option to force 80vh below
    if (heightType === 'maxHeightMinScreen') {
      return 'min(100%, 80vh)';
    }
    if (heightType === 'maxHeightScreen') {
      return '80vh';
    }
    if (heightType === 'inherit') {
      return '100%';
    }
    return '100%';
  }, [heightType]);

  return (
    <StyledImageWithLoading
      className={className}
      maxHeight={maxHeight}
      widthType={widthType}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={setContentIsLoaded}
    />
  );
}

type StyledImageWithLoadingProps = {
  maxHeight: string;
  widthType: ContentWidthType;
};

export const StyledImageWithLoading = styled.img<StyledImageWithLoadingProps>`
  display: block;
  max-height: ${({ maxHeight }) => maxHeight};
  ${({ widthType }) => (widthType === 'fullWidth' ? 'width' : 'max-width')}: 100%;
`;
