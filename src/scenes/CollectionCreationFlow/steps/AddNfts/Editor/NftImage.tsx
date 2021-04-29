import styled, { keyframes } from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft?: Nft;
  isDragging?: boolean;
};

function NftImage({ nft, isDragging = false }: Props) {
  const srcUrl = nft?.image_url;
  return isDragging ? (
    <StyledDraggingImage srcUrl={srcUrl} />
  ) : (
    <StyledGridImage srcUrl={srcUrl} />
  );
}

const StyledGridImage = styled.div<{ srcUrl?: string }>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`}};
  background-size: contain;
  // TODO handle non square images
  height: 280px;
  width: 280px;
`;

const grow = keyframes`
  from {height: 280px; width 280px};
  to {height: 284px; width: 284px}
`;

const StyledDraggingImage = styled(StyledGridImage)`
  box-shadow: 0px 8px 15px 4px rgb(0 0 0 / 34%);
  height: 284px;
  width: 284px;

  // TODO investigate smooth scaling
  // transition: width 200ms, height 200ms;
  // animation: ${grow} 50ms linear;
`;

export default NftImage;
