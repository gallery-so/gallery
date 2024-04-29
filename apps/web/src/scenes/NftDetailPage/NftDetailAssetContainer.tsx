import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useGetSinglePreviewImage } from 'shared/relay/useGetPreviewImages';
import styled from 'styled-components';

import Shimmer from '~/components/Shimmer/Shimmer';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { NftDetailAssetContainerFragment$key } from '~/generated/NftDetailAssetContainerFragment.graphql';
import { useContainedDimensionsForToken } from '~/hooks/useContainedDimensionsForToken';
import { useNftRetry } from '~/hooks/useNftRetry';

import { NftDetailAssetComponent } from './NftDetailAsset';

type Props = {
  tokenRef: NftDetailAssetContainerFragment$key;
  toggleLightbox: () => void;
};

// This component handles the logic of displaying the preview vs raw media, as well as the loading shimmer state.
export default function NftDetailAssetContainer({ tokenRef, toggleLightbox }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetContainerFragment on Token {
        dbid
        definition {
          media @required(action: THROW) {
            ... on Media {
              ...useContainedDimensionsForTokenFragment
            }
            ... on HtmlMedia {
              __typename
            }
          }
        }

        ...useGetPreviewImagesSingleFragment
        ...NftDetailAssetComponentFragment
      }
    `,
    tokenRef
  );
  const tokenDbid = token.dbid;

  const { handleNftLoaded } = useNftRetry({
    tokenId: token.dbid,
  });

  const { cacheLoadedImageUrls, cachedUrls } = useNftPreviewFallbackState();
  const resultDimensions = useContainedDimensionsForToken({
    mediaRef: token.definition.media,
  });
  const imageUrl =
    useGetSinglePreviewImage({ tokenRef: token, size: 'large', shouldThrow: false }) ?? '';

  const handleRawLoad = useCallback(() => {
    cacheLoadedImageUrls(tokenDbid, 'raw', imageUrl, resultDimensions);
    handleNftLoaded();
  }, [cacheLoadedImageUrls, tokenDbid, imageUrl, resultDimensions, handleNftLoaded]);

  const hasPreviewUrl = cachedUrls[tokenDbid]?.type === 'preview';
  const hasRawUrl = cachedUrls[tokenDbid]?.type === 'raw';
  const shouldShowShimmer = !(hasPreviewUrl || hasRawUrl);

  return (
    <>
      <AssetContainer isVisible={hasPreviewUrl}>
        <StyledImage
          src={cachedUrls[tokenDbid]?.url}
          onLoad={handleNftLoaded}
          height={resultDimensions.height}
          width={resultDimensions.width}
        />
      </AssetContainer>
      {shouldShowShimmer && (
        <ShimmerContainer>
          <Shimmer />
        </ShimmerContainer>
      )}
      <AssetContainer isVisible={hasRawUrl}>
        <NftDetailAssetComponent
          onLoad={handleRawLoad}
          tokenRef={token}
          toggleLightbox={toggleLightbox}
        />
      </AssetContainer>
    </>
  );
}

const AssetContainer = styled.div<{ isVisible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  ${({ isVisible }) =>
    isVisible &&
    `
  opacity: 1;
  pointer-events: auto;
  `}
`;

const StyledImage = styled.img`
  border: none;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ShimmerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
