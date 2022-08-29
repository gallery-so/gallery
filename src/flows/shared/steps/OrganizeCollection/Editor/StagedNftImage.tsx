import styled from 'styled-components';
import NftPreviewLabel from 'components/NftPreview/NftPreviewLabel';
import { graphql, useFragment } from 'react-relay';
import { StagedNftImageFragment$key } from '__generated__/StagedNftImageFragment.graphql';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import { useThrowOnMediaFailure } from 'hooks/useNftRetry';
import { useImageFailureCheck } from 'hooks/useImageFailureCheck';

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

  if (!result.urls.large) {
    throw new CouldNotRenderNftError('StagedNftImage', 'could not find a large url');
  }

  if (result.type === 'video') {
    return (
      <StagedNftImageVideo
        size={size}
        onLoad={onLoad}
        hideLabel={hideLabel}
        tokenName={token.name}
        url={result.urls.large}
        setNodeRef={setNodeRef}
        collectionName={token.contract?.name ?? null}
        {...props}
      />
    );
  } else {
    return (
      <StagedNftImageImage
        size={size}
        onLoad={onLoad}
        hideLabel={hideLabel}
        tokenName={token.name}
        setNodeRef={setNodeRef}
        url={result.urls.large}
        collectionName={token.contract?.name ?? null}
        {...props}
      />
    );
  }
}

type StagedNftImageImageProps = {
  url: string;
  size: number;
  tokenName: string | null;
  hideLabel: boolean;
  onLoad: () => void;
  collectionName: string | null;
  setNodeRef: (node: HTMLElement | null) => void;
};

function StagedNftImageImage({
  url,
  size,
  onLoad,
  hideLabel,
  tokenName,
  setNodeRef,
  collectionName,
  ...props
}: StagedNftImageImageProps) {
  const { handleError } = useThrowOnMediaFailure('StagedNftImageImage');

  // We have to use this since we're not using an actual img element
  useImageFailureCheck({ url, onLoad, onError: handleError });

  return (
    <StyledGridImage srcUrl={url} ref={setNodeRef} size={size} {...props}>
      {hideLabel ? null : (
        <StyledNftPreviewLabel title={tokenName} collectionName={collectionName} />
      )}
    </StyledGridImage>
  );
}

type StagedNftImageVideoProps = {
  url: string;
  size: number;
  tokenName: string | null;
  hideLabel: boolean;
  onLoad: () => void;
  collectionName: string | null;
  setNodeRef: (node: HTMLElement | null) => void;
};

function StagedNftImageVideo({
  url,
  size,
  onLoad,
  hideLabel,
  tokenName,
  setNodeRef,
  collectionName,
  ...props
}: StagedNftImageVideoProps) {
  return (
    <VideoContainer ref={setNodeRef} size={size} {...props}>
      <StyledGridVideo onLoad={onLoad} src={url} />
      {hideLabel ? null : (
        <StyledNftPreviewLabel title={tokenName} collectionName={collectionName} />
      )}
    </VideoContainer>
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
`;

export default StagedNftImage;
