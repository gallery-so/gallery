import { useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft?: Nft;
};

function NftImage({ nft }: Props) {
  const srcUrl = nft?.image_url;
  const [isMouseUp, setIsMouseUp] = useState(false);
  const handleMouseUp = useCallback(() => {
    setIsMouseUp(true);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  return <StyledDraggingImage srcUrl={srcUrl} isMouseUp={isMouseUp} />;
}

const grow = keyframes`
  from {height: 280px; width 280px};
  to {height: 284px; width: 284px}
`;

const StyledDraggingImage = styled.div<{
  srcUrl?: string;
  isMouseUp: boolean;
}>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`}};
  background-size: contain;

  box-shadow: 0px 8px 15px 4px rgb(0 0 0 / 34%);
  height: 284px;
  width: 284px;

  // we need to manually use isMouseUp instead of :active to set the grabbing cursor
  // because this element was never clicked, so it is not considered active
  cursor: ${({ isMouseUp }) => (isMouseUp ? 'grab' : 'grabbing')};

  // TODO investigate smooth scaling
  // transition: width 200ms, height 200ms;
  // animation: ${grow} 50ms linear;
`;

export default NftImage;
