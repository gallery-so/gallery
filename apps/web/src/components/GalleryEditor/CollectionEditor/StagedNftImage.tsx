import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import {
  NftFailureBoundary,
  NftLoadingFallback,
} from '~/components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '~/components/NftFailureFallback/NftFailureFallback';
import NftPreviewLabel from '~/components/NftPreview/NftPreviewLabel';
import { StagedNftImageFragment$key } from '~/generated/StagedNftImageFragment.graphql';
import { StagedNftImageRawFragment$key } from '~/generated/StagedNftImageRawFragment.graphql';
import { useImageFailureCheck } from '~/hooks/useImageFailureCheck';
import { useNftRetry, useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

type StagedNftImageProps = {
  tokenRef: StagedNftImageFragment$key;
  size: number;
  setNodeRef: (node: HTMLElement | null) => void;
  hideLabel: boolean;
};

function StagedNftImage({ tokenRef, setNodeRef, ...rest }: StagedNftImageProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageFragment on Token {
        dbid
        ...StagedNftImageRawFragment
      }
    `,
    tokenRef
  );

  return (
    <NftFailureBoundary
      tokenId={token.dbid}
      fallback={
        <FallbackContainer ref={setNodeRef} {...rest}>
          <NftFailureFallback tokenId={token.dbid} />
        </FallbackContainer>
      }
      loadingFallback={
        <FallbackContainer ref={setNodeRef} {...rest}>
          <NftLoadingFallback />
        </FallbackContainer>
      }
    >
      <RawStagedNftImage tokenRef={token} setNodeRef={setNodeRef} {...rest} />
    </NftFailureBoundary>
  );
}

const FallbackContainer = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`;

type RawStagedNftImageProps = {
  size: number;
  hideLabel: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  tokenRef: StagedNftImageRawFragment$key;
};

function RawStagedNftImage({
  size,
  tokenRef,
  hideLabel,
  setNodeRef,
  ...props
}: RawStagedNftImageProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageRawFragment on Token {
        dbid
        ...NftPreviewLabelFragment
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const url = useGetSinglePreviewImage({ tokenRef: token, size: 'large', shouldThrow: true }) ?? '';

  const { handleNftLoaded } = useNftRetry({ tokenId: token.dbid });

  const { handleError } = useThrowOnMediaFailure('RawStagedNftImage');

  // We have to use this since we're not using an actual img element
  useImageFailureCheck({ url, onLoad: handleNftLoaded, onError: handleError });

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
