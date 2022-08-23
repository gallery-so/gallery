import styled from 'styled-components';
import NftPreviewLabel from 'components/NftPreview/NftPreviewLabel';
import { graphql, useFragment } from 'react-relay';
import { StagedNftImageFragment$key } from '__generated__/StagedNftImageFragment.graphql';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { FALLBACK_URL } from 'utils/token';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import { useEffect } from 'react';
import { useThrowOnMediaFailure } from 'hooks/useNftDisplayRetryLoader';
import { useImageUrlLoader } from 'hooks/useImageUrlLoader';

type Props = {
  tokenRef: StagedNftImageFragment$key;
  size: number;
  setNodeRef: (node: HTMLElement | null) => void;
  hideLabel: boolean;
  onLoad: () => void;
};

function StagedNftImage({ tokenRef, size, hideLabel, setNodeRef, onLoad, ...props }: Props) {
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

  if (!result) {
    throw new CouldNotRenderNftError(
      'StatedNftImage',
      'could not compute getVideoOrImageUrlForNftPreview'
    );
  }

  const { handleError } = useThrowOnMediaFailure('StagedNftImage');

  // TODO: FIGURE OUT VIDEO HAQNDLING
  useImageUrlLoader({ url: result.urls.large, onError: handleError });

  if (result.type === 'video') {
    if (!result.urls.large) {
      throw new CouldNotRenderNftError('StagedNftImage', 'Video did not have a large url');
    }

    return (
      <VideoContainer ref={setNodeRef} size={size} {...props}>
        <StyledGridVideo onLoad={onLoad} src={result.urls.large} />
        {hideLabel ? null : (
          <StyledNftPreviewLabel title={token.name} collectionName={token.contract?.name} />
        )}
      </VideoContainer>
    );
  } else {
    // Note: There is no onLoad here because we are using a background-image
    // We don't need it since we don't show loading states here
    // At some point in the future, we may just want to switch
    // to suspense anyway to avoid all of this nightmare.
    if (!result.urls.large) {
      throw new CouldNotRenderNftError('StagedNftImage', 'Image did not have a large url');
    }

    return (
      <StyledGridImage srcUrl={result.urls.large} ref={setNodeRef} size={size} {...props}>
        {hideLabel ? null : (
          <StyledNftPreviewLabel title={token.name} collectionName={token.contract?.name} />
        )}
      </StyledGridImage>
    );
  }
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
`;

export default StagedNftImage;
