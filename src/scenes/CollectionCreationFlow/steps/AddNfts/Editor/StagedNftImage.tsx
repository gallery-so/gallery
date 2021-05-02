import styled, { keyframes } from 'styled-components';
import { Nft } from 'types/Nft';
import NftPreviewLabel from 'components/NftPreview/NftPreviewLabel';

type Props = {
  nft: Nft;
};

function NftImage({ nft }: Props) {
  const srcUrl = nft.image_url;

  return (
    <StyledGridImage srcUrl={srcUrl}>
      <StyledNftPreviewLabel nft={nft}></StyledNftPreviewLabel>
    </StyledGridImage>
  );
}

const StyledNftPreviewLabel = styled(NftPreviewLabel)`
  opacity: 0;
`;

const StyledGridImage = styled.div<{ srcUrl?: string }>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`}};
  background-size: contain;
  // TODO handle non square images
  height: 280px;
  width: 280px;
  position: relative;
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
