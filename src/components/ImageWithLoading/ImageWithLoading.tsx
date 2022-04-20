import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useMemo } from 'react';
import styled from 'styled-components';

type ContentWidthType =
  | 'fullWidth' // fill container
  | 'maxWidth'; // fill up to container

type ContentHeightType =
  | 'maxHeightScreen' // fill up to screen
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
  widthType = 'fullWidth',
  heightType,
  src,
  alt,
}: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  const maxHeight = useMemo(() => {
    if (heightType === 'maxHeightScreen') {
      return 'min(100%, 80vh)';
    }
    if (heightType === 'inherit') {
      return 'inherit';
    }
    return '100%';
  }, [heightType]);

  return (
    <StyledImg
      className={className}
      widthType={widthType}
      maxHeight={maxHeight}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={setContentIsLoaded}
    />
  );
}

type StyledImgProps = {
  widthType: ContentWidthType;
  maxHeight: string;
};

const StyledImg = styled.img<StyledImgProps>`
  display: block;
  ${({ widthType }) => (widthType === 'fullWidth' ? 'width' : 'max-width')}: 100%;
  max-height: ${({ maxHeight }) => maxHeight};
`;
