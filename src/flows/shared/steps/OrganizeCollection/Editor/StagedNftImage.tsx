import styled from 'styled-components';
import NftPreviewLabel from 'components/NftPreview/NftPreviewLabel';
import { graphql, useFragment } from 'react-relay';
import { StagedNftImageFragment$key } from '__generated__/StagedNftImageFragment.graphql';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { FALLBACK_URL } from 'utils/token';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import FailedNftPreview from 'components/NftPreview/FailedNftPreview';

type Props = {
  tokenRef: StagedNftImageFragment$key;
  size: number;
  setNodeRef: (node: HTMLElement | null) => void;
  hideLabel: boolean;
};

function StagedNftImage({ tokenRef, size, hideLabel, setNodeRef, ...props }: Props) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageFragment on Token {
        name
        contract {
          name
        }
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const reportError = useReportError();

  const result = getVideoOrImageUrlForNftPreview(token, reportError);

  if (!result || !result.urls.large) {
    reportError('Image URL not found for StagedNftImageDragging');
  }

  if (!result?.success) {
    return (
      <StyledFailedNftContainer ref={setNodeRef} {...props}>
        <FailedNftPreview size={size} />
        {hideLabel ? null : (
          <StyledNftPreviewLabel title={token.name} collectionName={token.contract?.name} />
        )}
      </StyledFailedNftContainer>
    );
  }

  if (result?.type === 'video') {
    return (
      <VideoContainer ref={setNodeRef} size={size} {...props}>
        <StyledGridVideo src={result?.urls.large ?? FALLBACK_URL} />
        {hideLabel ? null : (
          <StyledNftPreviewLabel title={token.name} collectionName={token.contract?.name} />
        )}
      </VideoContainer>
    );
  }

  return (
    <StyledGridImage
      srcUrl={result?.urls.large ?? FALLBACK_URL}
      ref={setNodeRef}
      size={size}
      {...props}
    >
      {hideLabel ? null : (
        <StyledNftPreviewLabel title={token.name} collectionName={token.contract?.name} />
      )}
    </StyledGridImage>
  );
}

const StyledFailedNftContainer = styled.div`
  position: relative;
`;

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
`;

export default StagedNftImage;
