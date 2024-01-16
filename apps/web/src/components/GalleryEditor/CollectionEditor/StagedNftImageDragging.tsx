import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { keyframes } from 'styled-components';

import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { StagedNftImageDraggingFragment$key } from '~/generated/StagedNftImageDraggingFragment.graphql';
import { StagedNftImageDraggingWithBoundaryFragment$key } from '~/generated/StagedNftImageDraggingWithBoundaryFragment.graphql';
import { useImageFailureCheck } from '~/hooks/useImageFailureCheck';
import useMouseUp from '~/hooks/useMouseUp';
import { useNftRetry, useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import colors from '~/shared/theme/colors';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

type StagedNftImageDraggingWithBoundaryProps = {
  tokenRef: StagedNftImageDraggingWithBoundaryFragment$key;
  size: number;
};

function StagedNftImageDraggingWithBoundary({
  tokenRef,
  size,
}: StagedNftImageDraggingWithBoundaryProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageDraggingWithBoundaryFragment on Token {
        dbid
        ...StagedNftImageDraggingFragment
      }
    `,
    tokenRef
  );

  return (
    <NftFailureBoundary tokenId={token.dbid}>
      <StagedNftImageDragging tokenRef={token} size={size} />
    </NftFailureBoundary>
  );
}

type StagedNftImageDraggingProps = {
  tokenRef: StagedNftImageDraggingFragment$key;
  size: number;
};

function StagedNftImageDragging({ tokenRef, size }: StagedNftImageDraggingProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageDraggingFragment on Token {
        dbid
        definition {
          contract {
            contractAddress {
              address
            }
          }
        }
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';

  const contractAddress = token.definition?.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  const isMouseUp = useMouseUp();

  // slightly enlarge the image when dragging
  const zoomedSize = useMemo(() => size * 1.02, [size]);

  const { handleNftLoaded } = useNftRetry({ tokenId: token.dbid });

  const { handleError } = useThrowOnMediaFailure('StagedNftImageDraggingImage');

  // We have to use this since we're not using an actual img element
  useImageFailureCheck({ url: imageUrl, onError: handleError });

  return (
    <ImageContainer
      size={zoomedSize}
      backgroundColorOverride={backgroundColorOverride}
      onLoad={handleNftLoaded}
    >
      <StyledDraggingImage srcUrl={imageUrl} isMouseUp={isMouseUp} size={zoomedSize} />
    </ImageContainer>
  );
}

const grow = keyframes`
  from {height: 280px; width: 280px}
  to {height: 284px; width: 284px}
`;

const ImageContainer = styled.div<{ size: number; backgroundColorOverride?: string }>`
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
  background-image: ${({ srcUrl }) => `url(${srcUrl})`};
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

export default StagedNftImageDraggingWithBoundary;
