import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '~/components/NftFailureFallback/NftFailureFallback';
import { CouldNotRenderNftError } from '~/errors/CouldNotRenderNftError';
import { BigNftFragment$key } from '~/generated/BigNftFragment.graphql';
import { BigNftPreviewFragment$key } from '~/generated/BigNftPreviewFragment.graphql';
import { useNftRetry, useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import getVideoOrImageUrlForNftPreview from '~/utils/graphql/getVideoOrImageUrlForNftPreview';
import {
  getBackgroundColorOverrideForContract,
  graphqlGetResizedNftImageUrlWithFallback,
} from '~/utils/token';

export const BIG_NFT_SIZE_PX = 160;

type BigNftProps = {
  tokenRef: BigNftFragment$key;
};

export function BigNft({ tokenRef }: BigNftProps) {
  const token = useFragment(
    graphql`
      fragment BigNftFragment on Token {
        dbid
        ...BigNftPreviewFragment
      }
    `,
    tokenRef
  );

  const { handleNftLoaded, handleNftError, retryKey, refreshingMetadata, refreshMetadata } =
    useNftRetry({
      tokenId: token.dbid,
    });

  return (
    <BigNftContainer>
      <NftFailureBoundary
        key={retryKey}
        tokenId={token.dbid}
        fallback={<NftFailureFallback onRetry={refreshMetadata} refreshing={refreshingMetadata} />}
        onError={handleNftError}
      >
        <BigNftPreview onLoad={handleNftLoaded} tokenRef={token} />
      </NftFailureBoundary>
    </BigNftContainer>
  );
}

type BigNftPreviewProps = {
  onLoad: () => void;
  tokenRef: BigNftPreviewFragment$key;
};

function BigNftPreview({ tokenRef, onLoad }: BigNftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment BigNftPreviewFragment on Token {
        contract {
          contractAddress {
            address
          }
        }
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );
  const result = getVideoOrImageUrlForNftPreview(token);

  if (!result) {
    throw new CouldNotRenderNftError('BigNft', 'could not compute getVideoOrImageUrlForNftPreview');
  }

  const resizedImage = graphqlGetResizedNftImageUrlWithFallback(result.urls.large, BIG_NFT_SIZE_PX);

  if (!resizedImage) {
    throw new CouldNotRenderNftError(
      'BigNft',
      'could not compute graphqlGetResizedNftImageUrlWithFallback'
    );
  }

  const backgroundColorOverride = getBackgroundColorOverrideForContract(
    token.contract?.contractAddress?.address ?? ''
  );

  const { handleError } = useThrowOnMediaFailure('BigNft');

  return (
    <>
      {result.type === 'video' ? (
        <BigNftVideoPreview onLoadedData={onLoad} onError={handleError} src={resizedImage.url} />
      ) : (
        <BigNftImagePreview
          onLoad={onLoad}
          onError={handleError}
          src={resizedImage.url}
          backgroundColorOverride={backgroundColorOverride}
        />
      )}
    </>
  );
}

export const BigNftContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${BIG_NFT_SIZE_PX}px;
  height: ${BIG_NFT_SIZE_PX}px;

  user-select: none;
`;

const BigNftVideoPreview = styled.video`
  max-width: 100%;
  max-height: 100%;
`;

const BigNftImagePreview = styled.img<{ backgroundColorOverride: string }>`
  max-width: 100%;
  max-height: 100%;
  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};
`;
