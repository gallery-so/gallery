import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import NftPreviewLabel from '~/components/NftPreview/NftPreviewLabel';
import { StagedNftImageFragment$key } from '~/generated/StagedNftImageFragment.graphql';
import { StagedNftImageImageFragment$key } from '~/generated/StagedNftImageImageFragment.graphql';
import { StagedNftImageRawFragment$key } from '~/generated/StagedNftImageRawFragment.graphql';
import { StagedNftImageVideoFragment$key } from '~/generated/StagedNftImageVideoFragment.graphql';
import { StagedNftImageWithoutFallbackFragment$key } from '~/generated/StagedNftImageWithoutFallbackFragment.graphql';
import { useImageFailureCheck } from '~/hooks/useImageFailureCheck';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

type StagedNftImageProps = {
  tokenRef: StagedNftImageFragment$key;
  size: number;
  setNodeRef: (node: HTMLElement | null) => void;
  hideLabel: boolean;
  onLoad: () => void;
};

function StagedNftImage({ tokenRef, ...rest }: StagedNftImageProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageFragment on Token {
        media {
          ... on Media {
            fallbackMedia {
              mediaURL
            }
          }
        }

        ...StagedNftImageRawFragment
        ...StagedNftImageWithoutFallbackFragment
      }
    `,
    tokenRef
  );

  return (
    <ReportingErrorBoundary
      fallback={
        <RawStagedNftImage
          {...rest}
          type="image"
          tokenRef={token}
          url={token.media?.fallbackMedia?.mediaURL}
        />
      }
    >
      <StagedNftImageWithoutFallback tokenRef={token} {...rest} />
    </ReportingErrorBoundary>
  );
}

type StagedNftImageWithoutFallbackProps = {
  tokenRef: StagedNftImageWithoutFallbackFragment$key;
  size: number;
  setNodeRef: (node: HTMLElement | null) => void;
  hideLabel: boolean;
  onLoad: () => void;
};

function StagedNftImageWithoutFallback({
  tokenRef,
  size,
  hideLabel,
  setNodeRef,
  onLoad,
  ...props
}: StagedNftImageWithoutFallbackProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageWithoutFallbackFragment on Token {
        ...StagedNftImageRawFragment
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const reportError = useReportError();
  const result = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    handleReportError: reportError,
  });

  if (!result) {
    throw new CouldNotRenderNftError(
      'StatedNftImage',
      'could not compute getVideoOrImageUrlForNftPreview'
    );
  }

  if (!result.urls.large) {
    throw new CouldNotRenderNftError('StagedNftImage', 'could not find a large url');
  }

  return (
    <RawStagedNftImage
      setNodeRef={setNodeRef}
      onLoad={onLoad}
      tokenRef={token}
      type={result.type}
      url={result.urls.large}
      hideLabel={hideLabel}
      size={size}
      {...props}
    />
  );
}

type RawStagedNftImageProps = {
  type: 'video' | 'image';
  size: number;
  onLoad: () => void;
  hideLabel: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  tokenRef: StagedNftImageRawFragment$key;
  url: string | undefined | null;
};

function RawStagedNftImage({
  type,
  setNodeRef,
  tokenRef,
  hideLabel,
  onLoad,
  size,
  url,
  ...props
}: RawStagedNftImageProps) {
  if (!url) {
    throw new CouldNotRenderNftError('RawStagedNftImage', 'url is undefined');
  }

  const token = useFragment(
    graphql`
      fragment StagedNftImageRawFragment on Token {
        ...StagedNftImageImageFragment
        ...StagedNftImageVideoFragment
      }
    `,
    tokenRef
  );

  if (type === 'video') {
    return (
      <StagedNftImageVideo
        size={size}
        onLoad={onLoad}
        hideLabel={hideLabel}
        tokenRef={token}
        url={url}
        setNodeRef={setNodeRef}
        {...props}
      />
    );
  } else {
    return (
      <StagedNftImageImage
        size={size}
        onLoad={onLoad}
        hideLabel={hideLabel}
        tokenRef={token}
        setNodeRef={setNodeRef}
        url={url}
        {...props}
      />
    );
  }
}

type StagedNftImageImageProps = {
  url: string;
  size: number;
  hideLabel: boolean;
  onLoad: () => void;
  tokenRef: StagedNftImageImageFragment$key;
  setNodeRef: (node: HTMLElement | null) => void;
};

function StagedNftImageImage({
  url,
  size,
  onLoad,
  tokenRef,
  hideLabel,
  setNodeRef,
  ...props
}: StagedNftImageImageProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageImageFragment on Token {
        ...NftPreviewLabelFragment
      }
    `,
    tokenRef
  );

  const { handleError } = useThrowOnMediaFailure('StagedNftImageImage');

  // We have to use this since we're not using an actual img element
  useImageFailureCheck({ url, onLoad, onError: handleError });

  return (
    <StyledGridImage srcUrl={url} ref={setNodeRef} size={size} {...props}>
      {hideLabel ? null : <StyledNftPreviewLabel tokenRef={token} interactive={false} />}
    </StyledGridImage>
  );
}

type StagedNftImageVideoProps = {
  url: string;
  size: number;
  hideLabel: boolean;
  onLoad: () => void;
  tokenRef: StagedNftImageVideoFragment$key;
  setNodeRef: (node: HTMLElement | null) => void;
};

function StagedNftImageVideo({
  url,
  size,
  onLoad,
  tokenRef,
  hideLabel,
  setNodeRef,
  ...props
}: StagedNftImageVideoProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageVideoFragment on Token {
        ...NftPreviewLabelFragment
      }
    `,
    tokenRef
  );

  return (
    <VideoContainer ref={setNodeRef} size={size} {...props}>
      <StyledGridVideo onLoad={onLoad} src={url} />
      {hideLabel ? null : <StyledNftPreviewLabel tokenRef={token} interactive={false} />}
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
  background-image: ${({ srcUrl }) => `url(${srcUrl})`};
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
