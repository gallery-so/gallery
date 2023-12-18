import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { TokenDetailAssetFragment$key } from '~/generated/TokenDetailAssetFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { useBreakpoint } from '~/hooks/useWindowSize';
import { NftDetailAssetComponent } from '~/scenes/NftDetailPage/NftDetailAsset';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import { fitDimensionsToContainerContain } from '~/shared/utils/fitDimensionsToContainer';
import { getBackgroundColorOverrideForContract } from '~/utils/token';
import Shimmer from '~/components/Shimmer/Shimmer';

type Props = {
  tokenRef: TokenDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
};

const DESKTOP_TOKEN_SIZE = 600;

function TokenDetailAsset({ tokenRef, hasExtraPaddingForNote }: Props) {
  // This is split up, so we can retry
  // this fragment when an NFT fails to load
  const token = useFragment<TokenDetailAssetFragment$key>(
    graphql`
      fragment TokenDetailAssetFragment on Token {
        dbid
        contract {
          contractAddress {
            address
          }
        }
        media @required(action: THROW) {
          ... on Media {
            dimensions {
              width
              height
            }
          }
          ... on HtmlMedia {
            __typename
          }
        }

        ...useGetPreviewImagesSingleFragment
        ...NftDetailAssetComponentFragment
      }
    `,
    tokenRef
  );

  const breakpoint = useBreakpoint();

  const contractAddress = token.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  // We do not want to enforce square aspect ratio for iframes https://github.com/gallery-so/gallery/pull/536
  const isIframe = token.media.__typename === 'HtmlMedia';
  const shouldEnforceSquareAspectRatio =
    !isIframe && (breakpoint === size.desktop || breakpoint === size.tablet);

  const { handleNftLoaded } = useNftRetry({
    tokenId: token.dbid,
  });

  const resultDimensions = useMemo(() => {
    const serverSourcedDimensions = token.media?.dimensions;
    if (serverSourcedDimensions?.width && serverSourcedDimensions.height) {
      return fitDimensionsToContainerContain({
        container: { width: DESKTOP_TOKEN_SIZE, height: DESKTOP_TOKEN_SIZE },
        source: {
          width: serverSourcedDimensions.width,
          height: serverSourcedDimensions.height,
        },
      });
    }

    return {
      height: DESKTOP_TOKEN_SIZE,
      width: DESKTOP_TOKEN_SIZE,
    };
  }, [token.media?.dimensions]);

  const { cacheLoadedImageUrls, cachedUrls } = useNftPreviewFallbackState();

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';

  const tokenId = token.dbid;

  const hasPreviewUrl = cachedUrls[tokenId]?.type === 'preview';
  const hasRawUrl = cachedUrls[tokenId]?.type === 'raw';

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
          <StyledImageWrapper className={hasPreviewUrl ? 'visible' : ''}>
            <StyledImage
              src={cachedUrls[tokenId]?.url}
              onLoad={handleNftLoaded}
              height={resultDimensions.height}
              width={resultDimensions.width}
            />
          </StyledImageWrapper>

          {!hasPreviewUrl && !hasRawUrl ? (
            <PreviewContainer>
              <Shimmer />
            </PreviewContainer>
          ) : null}
          <NftDetailAssetWrapper className={hasRawUrl ? 'visible' : ''}>
            <NftDetailAssetComponent onLoad={handleRawLoad} tokenRef={token} />
          </NftDetailAssetWrapper>
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

  ${({ shouldEnforceSquareAspectRatio }) =>
    shouldEnforceSquareAspectRatio ? 'aspect-ratio: 1' : ''};

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  @media only screen and ${breakpoints.tablet} {
    width: 600px;
  }

  // enforce auto width on NFT detail page as to not stretch to shimmer container
  ${StyledImageWithLoading} {
    width: auto;
  }
`;

export const StyledImage = styled.img<{ height: number; width: number }>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  border: none;
`;

const VisibilityContainer = styled.div`
  position: relative;
  width: inherit;
  padding-top: 100%; /* This creates a square container based on aspect ratio */
`;

const StyledImageWrapper = styled.div`
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
  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const NftDetailAssetWrapper = styled.div`
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
  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
`;

export default TokenDetailAsset;
