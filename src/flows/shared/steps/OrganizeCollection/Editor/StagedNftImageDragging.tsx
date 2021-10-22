import { NftMediaType } from 'components/core/enums';
import useMouseUp from 'hooks/useMouseUp';
import styled, { keyframes } from 'styled-components';
import { Nft } from 'types/Nft';
import { getMediaTypeForAssetUrl, getResizedNftImageUrlWithFallback } from 'utils/nft';

type Props = {
  nft: Nft;
};

function StagedNftImageDragging({ nft }: Props) {
  const srcUrl = getResizedNftImageUrlWithFallback(nft);
  const isMouseUp = useMouseUp();

  // TODO:
  // 1) can grab image still from video: https://stackoverflow.com/questions/40143958/javascript-generate-video-thumbnail-from-video-url/53836300
  // 2) OR simply use custom indexer when that's ready
  const isVideo = getMediaTypeForAssetUrl(srcUrl) === NftMediaType.VIDEO;

  return isVideo
    ? <VideoContainer isMouseUp={isMouseUp}>
      <StyledDraggingVideo src={srcUrl} />
    </VideoContainer>
    : <ImageContainer>
      <StyledDraggingImage srcUrl={srcUrl} isMouseUp={isMouseUp} />
    </ImageContainer>;
}

const grow = keyframes`
  from {height: 280px; width 280px};
  to {height: 284px; width: 284px}
`;

const VideoContainer = styled.div<{ isMouseUp: boolean }>`
  // TODO handle non square videos
  box-shadow: 0px 0px 16px 4px rgb(0 0 0 / 34%);
  height: 284px;
  width: 284px;

  // we need to manually use isMouseUp instead of :active to set the grabbing cursor
  // because this element was never clicked, so it is not considered active
  cursor: ${({ isMouseUp }) => (isMouseUp ? 'grab' : 'grabbing')};
`;

const StyledDraggingVideo = styled.video`
  width: 100%;
`;

const ImageContainer = styled.div`
  background: white;
  height: 284px;
  width: 284px;
`;

const StyledDraggingImage = styled.div<{
  srcUrl: string;
  isMouseUp: boolean;
}>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`}};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

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
