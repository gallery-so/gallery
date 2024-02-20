import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import Shimmer from '~/components/Shimmer/Shimmer';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { NftDetailAssetComponentFragment$key } from '~/generated/NftDetailAssetComponentFragment.graphql';
import { NftDetailAssetComponentWithoutFallbackFragment$key } from '~/generated/NftDetailAssetComponentWithoutFallbackFragment.graphql';
import { NftDetailAssetFragment$key } from '~/generated/NftDetailAssetFragment.graphql';
import { NftDetailAssetTokenFragment$key } from '~/generated/NftDetailAssetTokenFragment.graphql';
import { useContainedDimensionsForToken } from '~/hooks/useContainedDimensionsForToken';
import { useNftRetry } from '~/hooks/useNftRetry';
import { useBreakpoint } from '~/hooks/useWindowSize';
import SearchIcon from '~/icons/SearchIcon';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

import NftDetailAnimation from './NftDetailAnimation';
import NftDetailAudio from './NftDetailAudio';
import NftDetailGif from './NftDetailGif';
import NftDetailImage from './NftDetailImage';
import NftDetailLightbox from './NftDetailLightbox';
import NftDetailModel from './NftDetailModel';
import NftDetailVideo from './NftDetailVideo';

type NftDetailAssetComponentProps = {
  tokenRef: NftDetailAssetComponentFragment$key;
  onLoad: () => void;
};

export function NftDetailAssetComponent({ tokenRef, onLoad }: NftDetailAssetComponentProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetComponentFragment on Token {
        definition {
          media {
            ... on Media {
              fallbackMedia {
                mediaURL
              }
            }
          }
        }

        ...NftDetailAssetComponentWithoutFallbackFragment
      }
    `,
    tokenRef
  );

  return (
    // [GAL-4229] TODO: this failure boundary + wrapper can be greatly simplified.
    // but its child asset rendering components must be refactored to use `useGetPreviewImages`
    <ReportingErrorBoundary
      fallback={
        <NftDetailImage
          alt={null}
          onLoad={onLoad}
          imageUrl={token.definition.media?.fallbackMedia?.mediaURL}
        />
      }
    >
      <NftDetailAssetComponentWithouFallback tokenRef={token} onLoad={onLoad} />
    </ReportingErrorBoundary>
  );
}

type NftDetailAssetComponentWithoutFallbackProps = {
  tokenRef: NftDetailAssetComponentWithoutFallbackFragment$key;
  onLoad: () => void;
};

function NftDetailAssetComponentWithouFallback({
  tokenRef,
  onLoad,
}: NftDetailAssetComponentWithoutFallbackProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetComponentWithoutFallbackFragment on Token {
        dbid
        ...useGetPreviewImagesSingleFragment
        definition {
          name

          media @required(action: THROW) {
            ... on VideoMedia {
              __typename
              ...NftDetailVideoFragment
            }
            ... on ImageMedia {
              __typename
              contentRenderURL
            }
            ... on GIFMedia {
              __typename
              contentRenderURL
            }
            ... on HtmlMedia {
              __typename
            }
            ... on AudioMedia {
              __typename
            }
            ... on TextMedia {
              __typename
            }
            ... on GltfMedia {
              __typename
              ...NftDetailModelFragment
            }
            ... on UnknownMedia {
              __typename
            }
          }
        }
        ...NftDetailAnimationFragment
        ...NftDetailAudioFragment
        ...NftDetailGifFragment
      }
    `,
    tokenRef
  );

  if (token.definition.media.__typename === 'UnknownMedia') {
    // If we're dealing with UnknownMedia, we know the NFT is going to
    // fail to load, so we'll just immediately notify the parent
    // that this NftDetailAsset was unable to render
    throw new CouldNotRenderNftError('NftDetailAsset', 'Token media type was `UnknownMedia`');
  }

  switch (token.definition.media.__typename) {
    case 'HtmlMedia':
      return <NftDetailAnimation onLoad={onLoad} mediaRef={token} />;
    case 'VideoMedia':
      return <NftDetailVideo onLoad={onLoad} mediaRef={token.definition.media} />;
    case 'AudioMedia':
      return <NftDetailAudio onLoad={onLoad} tokenRef={token} />;
    case 'ImageMedia':
      const imageMedia = token.definition.media;

      if (!imageMedia.contentRenderURL) {
        throw new CouldNotRenderNftError(
          'NftDetailAsset',
          'Token media type was `ImageMedia` but contentRenderURL was null'
        );
      }

      return (
        <NftDetailImage
          alt={token.definition.name}
          onLoad={onLoad}
          imageUrl={imageMedia.contentRenderURL}
          onClick={() => {
            if (imageMedia.contentRenderURL) {
              window.open(imageMedia.contentRenderURL);
            }
          }}
        />
      );
    case 'GIFMedia':
      const gifMedia = token.definition.media;

      return (
        <NftDetailGif
          onLoad={onLoad}
          tokenRef={token}
          onClick={() => {
            if (gifMedia.contentRenderURL) {
              window.open(gifMedia.contentRenderURL);
            }
          }}
        />
      );
    case 'GltfMedia':
      return <NftDetailModel onLoad={onLoad} mediaRef={token.definition.media} fullHeight />;
    default:
      return <NftDetailAnimation onLoad={onLoad} mediaRef={token} />;
  }
}

type Props = {
  tokenRef: NftDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
  visibility?: string; // whether or not the nft is currently the visible "slide" in the detail page carousel
  toggleLightbox: () => void;
  showLightbox?: boolean;
};

function NftDetailAsset({
  tokenRef,
  hasExtraPaddingForNote,
  visibility,
  toggleLightbox,
  showLightbox,
}: Props) {
  const collectionToken = useFragment(
    graphql`
      fragment NftDetailAssetFragment on CollectionToken {
        token @required(action: THROW) {
          ...NftDetailAssetTokenFragment
        }
      }
    `,
    tokenRef
  );

  // This is split up, so we can retry
  // this fragment when an NFT fails to load
  const token = useFragment<NftDetailAssetTokenFragment$key>(
    graphql`
      fragment NftDetailAssetTokenFragment on Token {
        dbid
        definition {
          contract {
            contractAddress {
              address
            }
          }
          media @required(action: THROW) {
            ...useContainedDimensionsForTokenFragment
            ... on HtmlMedia {
              __typename
            }
          }
        }

        ...useGetPreviewImagesSingleFragment
        ...NftDetailAssetComponentFragment
      }
    `,
    collectionToken.token
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

  const resultDimensions = useContainedDimensionsForToken({ mediaRef: token.definition.media });
  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';

  const { cacheLoadedImageUrls, cachedUrls } = useNftPreviewFallbackState();
  const tokenId = token.dbid;

  const hasPreviewUrl = cachedUrls[tokenId]?.type === 'preview';
  const hasRawUrl = cachedUrls[tokenId]?.type === 'raw';
  const shouldShowShimmer = !(hasPreviewUrl || hasRawUrl);

  // only update the state if the selected token is set to 'visible'
  const handleRawLoad = useCallback(() => {
    if (visibility === 'visible') {
      cacheLoadedImageUrls(tokenId, 'raw', imageUrl, resultDimensions);
    }
    handleNftLoaded();
  }, [visibility, imageUrl, handleNftLoaded, cacheLoadedImageUrls, tokenId, resultDimensions]);

  const [lightboxContainer, setLightboxContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setLightboxContainer(document.getElementById(`lightbox-portal-${token.dbid}`));
    // only need to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledAssetContainer
      data-tokenid={token.dbid}
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftFailureBoundary tokenId={token.dbid}>
        {/*
          [GAL-4229] TODO: child rendering components should be refactored to use `useGetPreviewImages`
        */}
        <VisibilityContainer>
          {!showLightbox && (
            <StyledLightboxButton onClick={toggleLightbox}>
              <SearchIcon color={colors.white} />
            </StyledLightboxButton>
          )}
          {visibility === 'visible' &&
            lightboxContainer &&
            createPortal(
              <>
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
              </>,
              lightboxContainer
            )}
        </VisibilityContainer>
      </NftFailureBoundary>
      <NftDetailLightbox
        isLightboxOpen={Boolean(showLightbox)}
        toggleLightbox={toggleLightbox}
        tokenId={token.dbid}
      />
    </StyledAssetContainer>
  );
}

type AssetContainerProps = {
  footerHeight: number;
  shouldEnforceSquareAspectRatio: boolean;
  hasExtraPaddingForNote: boolean;
  backgroundColorOverride: string;
};

export const StyledLightboxButton = styled.div`
  opacity: 0;
  position: absolute;
  width: 32px;
  height: 32px;
  top: 10px;
  right: 10px;
  background: ${colors.black['800']};
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  transition: opacity 0.3s;
`;

const StyledAssetContainer = styled.div<AssetContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 20000; /* Above footer in event they overlap */
  width: 100%;

  ${({ shouldEnforceSquareAspectRatio }) =>
    shouldEnforceSquareAspectRatio ? 'aspect-ratio: 1' : ''};

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  @media only screen and ${breakpoints.desktop} {
    max-width: 800px;
  }

  // enforce auto width on NFT detail page as to not stretch to shimmer container
  ${StyledImageWithLoading} {
    width: auto;
  }

  &:hover {
    ${StyledLightboxButton} {
      opacity: 1;
    }
  }

`;

const StyledImage = styled.img`
  border: none;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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

  transition: width 1s, height 1s;
  // border: 1px solid blue;
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

export default NftDetailAsset;
