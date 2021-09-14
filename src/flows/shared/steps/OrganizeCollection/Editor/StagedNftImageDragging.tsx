import useMouseUp from 'hooks/useMouseUp';
import styled, { keyframes } from 'styled-components';
import { Nft } from 'types/Nft';
import getResizedNftImageUrlWithFallback from 'utils/resizeNftImageUrl';

type Props = {
  nft: Nft;
};

function StagedNftImageDragging({ nft }: Props) {
  const srcUrl = getResizedNftImageUrlWithFallback(nft);
  const isMouseUp = useMouseUp();

  return <StyledDraggingImage srcUrl={srcUrl} isMouseUp={isMouseUp} />;
}

const grow = keyframes`
  from {height: 280px; width 280px};
  to {height: 284px; width: 284px}
`;

const StyledDraggingImage = styled.div<{
  srcUrl: string;
  isMouseUp: boolean;
}>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`}};
  background-size: cover;

  box-shadow: 0px 0px 16px 4px rgb(0 0 0 / 34%);
  height: 284px;
  width: 284px;

  // we need to manually use isMouseUp instead of :active to set the grabbing cursor
  // because this element was never clicked, so it is not considered active
  cursor: ${({ isMouseUp }) => (isMouseUp ? 'grab' : 'grabbing')};

  // TODO investigate smooth scaling
  // transition: width 200ms, height 200ms;
  // animation: ${grow} 50ms linear;
`;

export default StagedNftImageDragging;
