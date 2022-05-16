import styled from 'styled-components';
import NftPreviewLabel from 'components/NftPreview/NftPreviewLabel';
import transitions from 'components/core/transitions';
import { graphql, useFragment } from 'react-relay';
import { StagedNftImageFragment$key } from '__generated__/StagedNftImageFragment.graphql';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { FALLBACK_URL } from 'utils/nft';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';

type Props = {
  nftRef: StagedNftImageFragment$key;
  size: number;
  setNodeRef: (node: HTMLElement | null) => void;
};

function StagedNftImage({ nftRef, size, setNodeRef, ...props }: Props) {
  const nft = useFragment(
    graphql`
      fragment StagedNftImageFragment on Nft {
        name
        openseaCollectionName
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    nftRef
  );

  const reportError = useReportError();
  const result = getVideoOrImageUrlForNftPreview(nft, reportError);

  if (!result || !result.urls.large) {
    reportError('Image URL not found for StagedNftImageDragging');
  }

  return result?.type === 'video' ? (
    <VideoContainer ref={setNodeRef} size={size} {...props}>
      <StyledGridVideo src={result?.urls.large ?? FALLBACK_URL} />
      <StyledNftPreviewLabel title={nft.name} collectionName={nft.openseaCollectionName} />
    </VideoContainer>
  ) : (
    <StyledGridImage
      srcUrl={result?.urls.large ?? FALLBACK_URL}
      ref={setNodeRef}
      size={size}
      {...props}
    >
      <StyledNftPreviewLabel title={nft.name} collectionName={nft.openseaCollectionName} />
    </StyledGridImage>
  );
}

const VideoContainer = styled.div<{ size: number }>`
  // TODO handle non square videos
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  position: relative;
`;

const StyledGridVideo = styled.video`
  width: 100%;
`;

type StyledGridImageProps = {
  srcUrl: string;
  size: number;
};

const StyledGridImage = styled.div<StyledGridImageProps>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`}};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  // TODO handle non square images
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  position: relative;
`;

const StyledNftPreviewLabel = styled(NftPreviewLabel)`
  opacity: 0;
  transition: opacity ${transitions.cubic};
`;

// Potentially useful links:
// https://github.com/clauderic/dnd-kit/blob/6f762a4d8d0ea047c9e9ba324448d4aca258c6a0/stories/components/Item/Item.tsx
// https://github.com/clauderic/dnd-kit/blob/54c877875cf7ec6d4367ca11ce216cc3eb6475d2/stories/2%20-%20Presets/Sortable/Sortable.tsx#L201
// https://github.com/clauderic/dnd-kit/blob/6f762a4d8d0ea047c9e9ba324448d4aca258c6a0/stories/components/Item/Item.module.css#L43

export default StagedNftImage;
