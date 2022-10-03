import { useMemo } from 'react';
import styled from 'styled-components';
import isSvg from 'utils/isSvg';
import noop from 'utils/noop';
import { useThrowOnMediaFailure } from 'hooks/useNftRetry';
import { isFirefox } from 'utils/browser';

type ContentHeightType =
  | 'maxHeightMinScreen' // fill up to 80vh of screen or 100% of container
  | 'maxHeightScreen' // fill up to 80vh of screen
  | 'inherit';

type Props = {
  className?: string;
  src: string;
  alt: string;
  heightType?: ContentHeightType;
  onClick?: () => void;
  onLoad: JSX.IntrinsicElements['img']['onLoad'];
};

export default function ImageWithLoading({
  className,
  src,
  alt,
  heightType,
  onClick = noop,
  onLoad,
}: Props) {
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

  const renderFullWidth = isSvg(src) && !isFirefox();
  const { handleError } = useThrowOnMediaFailure('ImageWithLoading');

  return (
    <StyledImageWithLoading
      className={className}
      maxHeight={maxHeight}
      renderFullWidth={renderFullWidth}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={onLoad}
      onError={handleError}
      onClick={onClick}
    />
  );
}

type StyledImageWithLoadingProps = {
  maxHeight: string;
  renderFullWidth: boolean;
};

export const StyledImageWithLoading = styled.img<StyledImageWithLoadingProps>`
  display: block;
  max-height: ${({ maxHeight }) => maxHeight};
  width: ${({ renderFullWidth }) => (renderFullWidth ? '100%' : 'auto')};
  max-width: 100%;
  cursor: pointer;
`;
