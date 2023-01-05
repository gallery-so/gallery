import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import NftPreviewLabel from '~/components/NftPreview/NftPreviewLabel';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { CouldNotRenderNftError } from '~/errors/CouldNotRenderNftError';
import { StagedNftImageImageNewFragment$key } from '~/generated/StagedNftImageImageNewFragment.graphql';
import { StagedNftImageNewFragment$key } from '~/generated/StagedNftImageNewFragment.graphql';
import { StagedNftImageVideoNewFragment$key } from '~/generated/StagedNftImageVideoNewFragment.graphql';
import { useImageFailureCheck } from '~/hooks/useImageFailureCheck';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import getVideoOrImageUrlForNftPreview from '~/utils/graphql/getVideoOrImageUrlForNftPreview';

type Props = {
  tokenRef: StagedNftImageNewFragment$key;
  size: number;
  setNodeRef: (node: HTMLElement | null) => void;
  hideLabel: boolean;
  onLoad: () => void;
};

function StagedNftImage({ tokenRef, size, hideLabel, setNodeRef, onLoad, ...props }: Props) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageNewFragment on Token {
        ...StagedNftImageVideoNewFragment
        ...StagedNftImageImageNewFragment
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
        tokenRef={token}
        url={result.urls.large}
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
        url={result.urls.large}
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
  tokenRef: StagedNftImageImageNewFragment$key;
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
      fragment StagedNftImageImageNewFragment on Token {
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
  tokenRef: StagedNftImageVideoNewFragment$key;
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
      fragment StagedNftImageVideoNewFragment on Token {
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
