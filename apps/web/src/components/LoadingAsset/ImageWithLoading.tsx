import { SyntheticEvent, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { noop } from '~/shared/utils/noop';
import { isFirefox } from '~/utils/browser';
import isSvg from '~/utils/isSvg';

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
  onError?: () => void;
  onLoad: JSX.IntrinsicElements['img']['onLoad'];
};

export default function ImageWithLoading({
  className,
  src,
  alt,
  heightType,
  onClick = noop,
  onError = noop,
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

  const handleErrorLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement, Event>) => {
      onError();
      handleError(e);
    },
    [handleError, onError]
  );

  return (
    <StyledImageWithLoading
      className={className}
      maxHeight={maxHeight}
      renderFullWidth={renderFullWidth}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={onLoad}
      onError={handleErrorLoad}
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
