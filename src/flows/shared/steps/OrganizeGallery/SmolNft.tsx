import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { graphql, useFragment } from 'react-relay';
import {
  getBackgroundColorOverrideForContract,
  graphqlGetResizedNftImageUrlWithFallback,
} from 'utils/token';
import styled from 'styled-components';
import { NftFailureBoundary } from 'components/NftFailureFallback/NftFailureBoundary';
import { useNftDisplayRetryLoader, useThrowOnMediaFailure } from 'hooks/useNftDisplayRetryLoader';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import { SmolNftFragment$key } from '../../../../../__generated__/SmolNftFragment.graphql';
import { SmolNftPreviewFragment$key } from '../../../../../__generated__/SmolNftPreviewFragment.graphql';

const SMOL_NFT_SIZE_PX = 25;

type SmolNftProps = {
  tokenRef: SmolNftFragment$key;
};

export function SmolNft({ tokenRef }: SmolNftProps) {
  const token = useFragment(
    graphql`
      fragment SmolNftFragment on Token {
        dbid
        ...SmolNftPreviewFragment
      }
    `,
    tokenRef
  );

  const { handleNftLoaded, handleNftError, retryKey } = useNftDisplayRetryLoader({
    tokenId: token.dbid,
  });

  return (
    <SmolNftContainer>
      {/* We're using a null fallback here since NftFailureFallback is too big */}
      <NftFailureBoundary key={retryKey} fallback={null} onError={handleNftError}>
        <SmolNftPreview onLoad={handleNftLoaded} tokenRef={token} />
      </NftFailureBoundary>
    </SmolNftContainer>
  );
}

type SmolNftPreviewProps = {
  onLoad: () => void;
  tokenRef: SmolNftPreviewFragment$key;
};

function SmolNftPreview({ tokenRef, onLoad }: SmolNftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment SmolNftPreviewFragment on Token {
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
    throw new CouldNotRenderNftError(
      'SmolNft',
      'could not compute getVideoOrImageUrlForNftPreview'
    );
  }

  const resizedImage = graphqlGetResizedNftImageUrlWithFallback(
    result.urls.small,
    SMOL_NFT_SIZE_PX
  );

  if (!resizedImage) {
    throw new CouldNotRenderNftError(
      'SmolNft',
      'could not compute graphqlGetResizedNftImageUrlWithFallback'
    );
  }

  const backgroundColorOverride = getBackgroundColorOverrideForContract(
    token.contract?.contractAddress?.address ?? ''
  );

  const { handleError } = useThrowOnMediaFailure('SmolNft');

  return (
    <>
      {result.type === 'video' ? (
        <SmolNftVideoPreview onLoadedData={onLoad} onError={handleError} src={resizedImage.url} />
      ) : (
        <SmolNftImagePreview
          onError={handleError}
          onLoad={onLoad}
          src={resizedImage.url}
          backgroundColorOverride={backgroundColorOverride}
        />
      )}
    </>
  );
}

export const SmolNftContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${SMOL_NFT_SIZE_PX}px;
  height: ${SMOL_NFT_SIZE_PX}px;
`;

const SmolNftVideoPreview = styled.video`
  max-width: 100%;
  max-height: 100%;
`;

const SmolNftImagePreview = styled.img<{ backgroundColorOverride: string }>`
  max-width: 100%;
  max-height: 100%;
  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};
`;
