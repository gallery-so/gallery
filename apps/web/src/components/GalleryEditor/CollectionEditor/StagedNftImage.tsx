import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import NftPreviewLabel from '~/components/NftPreview/NftPreviewLabel';
import { StagedNftImageFragment$key } from '~/generated/StagedNftImageFragment.graphql';
import { StagedNftImageImageFragment$key } from '~/generated/StagedNftImageImageFragment.graphql';
import { StagedNftImageRawFragment$key } from '~/generated/StagedNftImageRawFragment.graphql';
import { StagedNftImageWithoutFallbackFragment$key } from '~/generated/StagedNftImageWithoutFallbackFragment.graphql';
import { useImageFailureCheck } from '~/hooks/useImageFailureCheck';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

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
        <RawStagedNftImage {...rest} tokenRef={token} url={token.media?.fallbackMedia?.mediaURL} />
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
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' });

  if (!imageUrl) {
    throw new CouldNotRenderNftError('StagedNftImage', 'could not find a large url');
  }

  return (
    <RawStagedNftImage
      setNodeRef={setNodeRef}
      onLoad={onLoad}
      tokenRef={token}
      url={imageUrl}
      hideLabel={hideLabel}
      size={size}
      {...props}
    />
  );
}

type RawStagedNftImageProps = {
  size: number;
  onLoad: () => void;
  hideLabel: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  tokenRef: StagedNftImageRawFragment$key;
  url: string | undefined | null;
};

function RawStagedNftImage({
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
      }
    `,
    tokenRef
  );

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
