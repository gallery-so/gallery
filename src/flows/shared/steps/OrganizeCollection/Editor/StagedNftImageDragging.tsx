import colors from 'components/core/colors';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import useMouseUp from 'hooks/useMouseUp';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { keyframes } from 'styled-components';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { FALLBACK_URL, getBackgroundColorOverrideForContract } from 'utils/nft';
import { StagedNftImageDraggingFragment$key } from '__generated__/StagedNftImageDraggingFragment.graphql';

type Props = {
  nftRef: StagedNftImageDraggingFragment$key;
  size: number;
};

function StagedNftImageDragging({ nftRef, size }: Props) {
  const nft = useFragment(
    graphql`
      fragment StagedNftImageDraggingFragment on Nft {
        contractAddress
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    nftRef
  );

  const isMouseUp = useMouseUp();

  // slightly enlarge the image when dragging
  const zoomedSize = useMemo(() => size * 1.02, [size]);

  const reportError = useReportError();
  const result = getVideoOrImageUrlForNftPreview(nft, reportError);

  if (!result || !result.urls.large) {
    reportError('Image URL not found for StagedNftImageDragging');
  }

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(nft.contractAddress ?? ''),
    [nft.contractAddress]
  );

  return result?.type === 'video' ? (
    <VideoContainer isMouseUp={isMouseUp} size={zoomedSize}>
      <StyledDraggingVideo src={result?.urls.large ?? FALLBACK_URL} />
    </VideoContainer>
  ) : (
    <ImageContainer size={zoomedSize} backgroundColorOverride={backgroundColorOverride}>
      <StyledDraggingImage
        srcUrl={result?.urls.large ?? FALLBACK_URL}
        isMouseUp={isMouseUp}
        size={zoomedSize}
      />
    </ImageContainer>
  );
}

const grow = keyframes`
  from {height: 280px; width 280px};
  to {height: 284px; width: 284px}
`;

const VideoContainer = styled.div<{ isMouseUp: boolean; size: number }>`
  // TODO handle non square videos
  box-shadow: 0px 0px 16px 4px rgb(0 0 0 / 34%);
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;

  // we need to manually use isMouseUp instead of :active to set the grabbing cursor
  // because this element was never clicked, so it is not considered active
  cursor: ${({ isMouseUp }) => (isMouseUp ? 'grab' : 'grabbing')};
`;

const StyledDraggingVideo = styled.video`
  width: 100%;
`;

const ImageContainer = styled.div<{ size: number; backgroundColorOverride: string }>`
  background-color: ${({ backgroundColorOverride }) =>
    backgroundColorOverride ? backgroundColorOverride : colors.white};
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`;

const StyledDraggingImage = styled.div<{
  srcUrl: string;
  isMouseUp: boolean;
  size: number;
}>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`}};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  box-shadow: 0px 0px 16px 4px rgb(0 0 0 / 34%);
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;

  // we need to manually use isMouseUp instead of :active to set the grabbing cursor
  // because this element was never clicked, so it is not considered active
  cursor: ${({ isMouseUp }) => (isMouseUp ? 'grab' : 'grabbing')};

  // TODO investigate smooth scaling
  // transition: width 200ms, height 200ms;
  // animation: ${grow} 50ms linear;
`;

export default StagedNftImageDragging;
