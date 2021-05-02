import styled, { keyframes } from 'styled-components';
import { Nft } from 'types/Nft';
import NftPreviewLabel, {
  StyledNftPreviewLabel,
} from 'components/NftPreview/NftPreviewLabel';
import { useCallback } from 'react';

type Props = {
  nft: Nft;
  isDragging?: boolean;
  onUnstageNft: (id: string) => void;
};

function NftImage({ nft, isDragging = false, onUnstageNft }: Props) {
  const srcUrl = nft.image_url;

  const handleRemoveButtonClick = useCallback(() => {
    console.log('removing', nft.id);
    onUnstageNft(nft.id);
  }, [nft.id, onUnstageNft]);

  return (
    <StyledGridImage srcUrl={srcUrl}>
      <StyledRemoveButton onClick={handleRemoveButtonClick}>
        X
      </StyledRemoveButton>
      <NftPreviewLabel nft={nft}></NftPreviewLabel>
    </StyledGridImage>
  );
}

const StyledGridImage = styled.div<{ srcUrl?: string }>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`}};
  background-size: contain;
  // TODO handle non square images
  height: 280px;
  width: 280px;
  position: relative;

  &:hover ${StyledNftPreviewLabel} {
    opacity: 1;
  }
`;

const StyledRemoveButton = styled.button`
  position: absolute;
`;

const grow = keyframes`
  from {height: 280px; width 280px};
  to {height: 284px; width: 284px}
`;

// potentially useful links:
// https://github.com/clauderic/dnd-kit/blob/6f762a4d8d0ea047c9e9ba324448d4aca258c6a0/stories/components/Item/Item.tsx
// https://github.com/clauderic/dnd-kit/blob/54c877875cf7ec6d4367ca11ce216cc3eb6475d2/stories/2%20-%20Presets/Sortable/Sortable.tsx#L201
// https://github.com/clauderic/dnd-kit/blob/6f762a4d8d0ea047c9e9ba324448d4aca258c6a0/stories/components/Item/Item.module.css#L43

export default NftImage;
