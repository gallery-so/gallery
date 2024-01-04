import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import Shimmer from '~/components/Shimmer/Shimmer';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { TokenDetailAssetFragment$key } from '~/generated/TokenDetailAssetFragment.graphql';
import { useContainedDimensionsForToken } from '~/hooks/useContainedDimensionsForToken';
import { useNftRetry } from '~/hooks/useNftRetry';
import { useBreakpoint } from '~/hooks/useWindowSize';
import { NftDetailAssetComponent } from '~/scenes/NftDetailPage/NftDetailAsset';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

type Props = {
  tokenRef: TokenDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
};

function TokenDetailAsset({ tokenRef, hasExtraPaddingForNote }: Props) {
  // This is split up, so we can retry
  // this fragment when an NFT fails to load
  const token = useFragment<TokenDetailAssetFragment$key>(
    graphql`
      fragment TokenDetailAssetFragment on Token {
        dbid
        definition {
          contract {
            contractAddress {
              address
            }
          }
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

  const breakpoint = useBreakpoint();

  const contractAddress = token.definition.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  // We do not want to enforce square aspect ratio for iframes https://github.com/gallery-so/gallery/pull/536
  const isIframe = token.definition.media.__typename === 'HtmlMedia';
  const shouldEnforceSquareAspectRatio =
    !isIframe && (breakpoint === size.desktop || breakpoint === size.tablet);

  const { handleNftLoaded } = useNftRetry({
    tokenId: token.dbid,
  });

  const resultDimensions = useContainedDimensionsForToken({
    mediaRef: token.definition.media,
  });

  const { cacheLoadedImageUrls, cachedUrls } = useNftPreviewFallbackState();

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';

  const tokenId = token.dbid;

  const hasPreviewUrl = cachedUrls[tokenId]?.type === 'preview';
  const hasRawUrl = cachedUrls[tokenId]?.type === 'raw';
  const shouldShowShimmer = !(hasPreviewUrl || hasRawUrl);

  const handleRawLoad = useCallback(() => {
    cacheLoadedImageUrls(tokenId, 'raw', imageUrl, resultDimensions);
    handleNftLoaded();
  }, [imageUrl, handleNftLoaded, cacheLoadedImageUrls, tokenId, resultDimensions]);

  return (
    <StyledAssetContainer
      data-tokenid={token.dbid}
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftFailureBoundary tokenId={token.dbid}>
        <VisibilityContainer>
          <AssetContainer isVisible={hasPreviewUrl}>
            <StyledImage
              src={cachedUrls[tokenId]?.url}
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
            <NftDetailAssetComponent onLoad={handleRawLoad} tokenRef={token} />
          </AssetContainer>
        </VisibilityContainer>
      </NftFailureBoundary>
    </StyledAssetContainer>
  );
}

type AssetContainerProps = {
  footerHeight: number;
  shouldEnforceSquareAspectRatio: boolean;
  hasExtraPaddingForNote: boolean;
  backgroundColorOverride: string;
};

const StyledAssetContainer = styled.div<AssetContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2; /* Above footer in event they overlap */
  width: 100%;

  ${({ shouldEnforceSquareAspectRatio }) =>
    shouldEnforceSquareAspectRatio ? 'aspect-ratio: 1' : ''};

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  @media only screen and ${breakpoints.tablet} {
    width: 100%;
  }

  @media only screen and ${breakpoints.desktop} {
    max-width: 800px;
  }

  // enforce auto width on NFT detail page as to not stretch to shimmer container
  ${StyledImageWithLoading} {
    width: auto;
  }
`;

const StyledImage = styled.img`
  border: none;
  max-width: 100%;
  max-height: 100%;
`;

const VisibilityContainer = styled.div`
  position: relative;
  width: inherit;
  padding-top: 100%; /* This creates a square container based on aspect ratio */
`;

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

  @media only screen and (max-width: ${size.tablet}px) {
    height: 296px;
    width: 296px;
  }
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

export default TokenDetailAsset;
