import styled from 'styled-components';

import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';

import transitions from '../core/transitions';

export function RawNftSelectorPreviewAsset({
  type,
  isSelected,
  src,
  onLoad,
}: {
  type: 'video' | 'image';
  isSelected: boolean;
  src: string | null | undefined;
  onLoad: () => void;
  alt?: string | null;
}) {
  const { handleError } = useThrowOnMediaFailure('SidebarPreviewAsset');

  if (!src) {
    throw new CouldNotRenderNftError('SidebarNftIcon', 'missing src');
  }

  // Some OpenSea assets don't have an image url,
  // so render a freeze-frame of the video instead
  if (type === 'video')
    return (
      <StyledVideo onLoadedData={onLoad} onError={handleError} isSelected={isSelected} src={src} />
    );

  return (
    <StyledImage
      isSelected={isSelected}
      src={src}
      alt="token"
      onLoad={onLoad}
      onError={handleError}
    />
  );
}
type SelectedProps = {
  isSelected?: boolean;
};
const StyledImage = styled.img<SelectedProps>`
  max-height: 100%;
  max-width: 100%;
  transition: opacity ${transitions.cubic};
  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};

  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const StyledVideo = styled.video<SelectedProps>`
  max-height: 100%;
  max-width: 100%;
  transition: opacity ${transitions.cubic};
  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};
  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;
