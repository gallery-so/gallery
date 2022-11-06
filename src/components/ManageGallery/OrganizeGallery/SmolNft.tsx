import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { CouldNotRenderNftError } from '~/errors/CouldNotRenderNftError';
import { SmolNftFragment$key } from '~/generated/SmolNftFragment.graphql';
import { SmolNftPreviewFragment$key } from '~/generated/SmolNftPreviewFragment.graphql';
import { useNftRetry, useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import getVideoOrImageUrlForNftPreview from '~/utils/graphql/getVideoOrImageUrlForNftPreview';
import {
  getBackgroundColorOverrideForContract,
  graphqlGetResizedNftImageUrlWithFallback,
} from '~/utils/token';

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

  const { handleNftLoaded, handleNftError, retryKey } = useNftRetry({
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
