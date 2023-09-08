import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
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
    <FallbackContainer ref={setNodeRef} {...rest}>
      <NftFailureBoundary tokenId={token.dbid}>
        <RawStagedNftImage tokenRef={token} {...rest} />
      </NftFailureBoundary>
    </FallbackContainer>
  );
}

const FallbackContainer = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`;

type RawStagedNftImageProps = {
  size: number;
  hideLabel: boolean;
  tokenRef: StagedNftImageRawFragment$key;
};

function RawStagedNftImage({ size, tokenRef, hideLabel, ...props }: RawStagedNftImageProps) {
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

  const url = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';

  const { handleNftLoaded } = useNftRetry({ tokenId: token.dbid });

  const { handleError } = useThrowOnMediaFailure('RawStagedNftImage');

  // We have to use this since we're not using an actual img element
  useImageFailureCheck({ url, onLoad: handleNftLoaded, onError: handleError });

  return (
    <StyledGridImage srcUrl={url} size={size} {...props}>
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
