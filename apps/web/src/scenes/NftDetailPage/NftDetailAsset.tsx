import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { NftDetailAssetComponentFragment$key } from '~/generated/NftDetailAssetComponentFragment.graphql';
import { NftDetailAssetComponentWithoutFallbackFragment$key } from '~/generated/NftDetailAssetComponentWithoutFallbackFragment.graphql';
import { NftDetailAssetFragment$key } from '~/generated/NftDetailAssetFragment.graphql';
import { NftDetailAssetTokenFragment$key } from '~/generated/NftDetailAssetTokenFragment.graphql';
import { useBreakpoint, useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import ExpandIcon from '~/icons/ExpandIcon';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

import NftDetailAnimation from './NftDetailAnimation';
import NftDetailAssetContainer from './NftDetailAssetContainer';
import NftDetailAudio from './NftDetailAudio';
import NftDetailGif from './NftDetailGif';
import NftDetailImage from './NftDetailImage';
import NftDetailLightbox, { getLightboxPortalElementId } from './NftDetailLightbox';
import NftDetailModel from './NftDetailModel';
import NftDetailVideo from './NftDetailVideo';

type NftDetailAssetComponentProps = {
  tokenRef: NftDetailAssetComponentFragment$key;
  onLoad: () => void;
  toggleLightbox: () => void;
};

export function NftDetailAssetComponent({
  tokenRef,
  onLoad,
  toggleLightbox,
}: NftDetailAssetComponentProps) {
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
      <NftDetailAssetComponentWithouFallback
        tokenRef={token}
        onLoad={onLoad}
        toggleLightbox={toggleLightbox}
      />
    </ReportingErrorBoundary>
  );
}

type NftDetailAssetComponentWithoutFallbackProps = {
  tokenRef: NftDetailAssetComponentWithoutFallbackFragment$key;
  onLoad: () => void;
  toggleLightbox: () => void;
};

function NftDetailAssetComponentWithouFallback({
  tokenRef,
  onLoad,
  toggleLightbox,
}: NftDetailAssetComponentWithoutFallbackProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetComponentWithoutFallbackFragment on Token {
        dbid
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
            if (toggleLightbox) {
              toggleLightbox();
              return;
            }
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
            if (toggleLightbox) {
              toggleLightbox();
              return;
            }
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
  isLightboxOpen?: boolean;
};

function NftDetailAsset({
  tokenRef,
  hasExtraPaddingForNote,
  visibility,
  toggleLightbox,
  isLightboxOpen,
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
            ... on HtmlMedia {
              __typename
            }
          }
        }
        ...NftDetailAssetContainerFragment
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

  const [lightboxContainer, setLightboxContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setLightboxContainer(document.getElementById(getLightboxPortalElementId(token.dbid)));
    // only need to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMobile = useIsMobileWindowWidth();

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
          {!isMobile && !isLightboxOpen && (
            <StyledLightboxButton onClick={toggleLightbox}>
              <ExpandIcon />
            </StyledLightboxButton>
          )}
          {visibility === 'visible' &&
            lightboxContainer &&
            createPortal(
              <NftDetailAssetContainer tokenRef={token} toggleLightbox={toggleLightbox} />,
              lightboxContainer
            )}
        </VisibilityContainer>
      </NftFailureBoundary>
      <NftDetailLightbox
        isLightboxOpen={Boolean(isLightboxOpen)}
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
  color: ${colors.white};
`;

const StyledAssetContainer = styled.div<AssetContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 100; /* Above footer in event they overlap */
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
    ${({ backgroundColorOverride }) =>
      backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};
  }

  &:hover {
    ${StyledLightboxButton} {
      opacity: 1;
    }
  }

`;

const VisibilityContainer = styled.div`
  position: relative;
  width: inherit;
  padding-top: 100%; /* This creates a square container based on aspect ratio */
`;

export default NftDetailAsset;
