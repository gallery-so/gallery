import breakpoints, { size } from 'components/core/breakpoints';
import { NftMediaType } from 'components/core/enums';
import styled from 'styled-components';
import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';
import { getMediaType, getResizedNftImageUrlWithFallback } from 'utils/nft';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_NAVBAR_HEIGHT } from 'components/core/Page/constants';
import NftDetailAnimation from './NftDetailAnimation';
import NftDetailVideo from './NftDetailVideo';
import NftDetailAudio from './NftDetailAudio';
import NftDetailModel from './NftDetailModel';
import { useBreakpoint } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import { useContentState } from 'contexts/shimmer/ShimmerContext';
import { graphql, useFragment } from 'react-relay';
import { NftDetailAssetFragment$key } from '__generated__/NftDetailAssetFragment.graphql';
import { NftDetailAssetComponentFragment$key } from '__generated__/NftDetailAssetComponentFragment.graphql';

type NftDetailAssetComponentProps = {
  nftRef: NftDetailAssetComponentFragment$key;
  maxHeight: number;
};

function NftDetailAssetComponent({ nftRef, maxHeight }: NftDetailAssetComponentProps) {
  const nft = useFragment(
    graphql`
      fragment NftDetailAssetComponentFragment on GalleryNft {
        nft @required(action: THROW) {
          media @required(action: THROW) {
            ... on HtmlMedia {
              __typename
            }
            ... on AudioMedia {
              __typename
            }
            ... on etc
          }
          name
          ...NftDetailAudioFragment
          ...etc
        }
      }
    `,
    nftRef
  );

  const assetType = getMediaType(nft);
  const breakpoint = useBreakpoint();

  // make this another component
  const resizableImage = useMemo(
    () => (
      <ImageWithLoading
        src={getResizedNftImageUrlWithFallback(nft, 1200)}
        alt={nft.name}
        widthType="maxWidth"
        heightType={breakpoint === size.desktop ? 'maxHeightScreen' : undefined}
      />
    ),
    [breakpoint, nft]
  );

  switch (nft.nft.media.__typename) {
    case 'HtmlMedia':
      return <NftDetailAnimation nftRef={nft} />;
  }

  switch (assetType) {
    case NftMediaType.IMAGE:
      return resizableImage;
    case NftMediaType.AUDIO:
      return <NftDetailAudio nftRef={nft.nft} />;
    case NftMediaType.VIDEO:
      return <NftDetailVideo nft={nft} maxHeight={maxHeight} />;
    case NftMediaType.ANIMATION:
      return <NftDetailAnimation nft={nft} />;
    case NftMediaType.MODEL:
      return <NftDetailModel nft={nft} />;
    default:
      return resizableImage;
  }
}

type Props = {
  nftRef: NftDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
};

// number that determines a reasonable max height for the displayed NFT
let heightWithoutNavAndFooterGutters: number;

if (typeof window !== 'undefined') {
  // NOTE: don't need to handle MOBILE footer height here, since this logic only applies to desktop + tablet
  heightWithoutNavAndFooterGutters =
    window.screen.availHeight - 2 * (GLOBAL_NAVBAR_HEIGHT + GLOBAL_FOOTER_HEIGHT);
}

function NftDetailAsset({ nftRef, hasExtraPaddingForNote }: Props) {
  const nft = useFragment(
    graphql`
      fragment NftDetailAssetFragment on GalleryNft {
        nft @required(action: THROW) {
          media @required(action: THROW) {
            ... on HtmlMedia {
              __typename
            }
          }
        }
      }
    `,
    nftRef
  );

  const maxHeight = Math.min(
    heightWithoutNavAndFooterGutters,
    // TODO: this number should be determined by the dimensions of the media itself. once the media is fetched,
    // we should grab its dimensions and set it on the shimmer context. this will allow us to display very large
    // NFTs on very large screens
    600
  );

  const { aspectRatioType } = useContentState();
  const breakpoint = useBreakpoint();

  // We do not want to enforce square aspect ratio for iframes https://github.com/gallery-so/gallery/pull/536
  const isIframe = nft.nft.media.__typename === 'HtmlMedia';
  const shouldEnforceSquareAspectRatio =
    !isIframe &&
    (aspectRatioType !== 'wide' || breakpoint === size.desktop || breakpoint === size.tablet);

  return (
    <StyledAssetContainer
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      maxHeight={maxHeight}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
    >
      <NftDetailAssetComponent nftRef={nft} maxHeight={maxHeight} />
    </StyledAssetContainer>
  );
}

type AssetContainerProps = {
  footerHeight: number;
  maxHeight: number;
  shouldEnforceSquareAspectRatio: boolean;
  hasExtraPaddingForNote: boolean;
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

  @media only screen and ${breakpoints.tablet} {
    width: 100%;

    ${({ hasExtraPaddingForNote, footerHeight }) =>
      hasExtraPaddingForNote ? `max-height: calc(85vh - 46px - ${footerHeight}px)` : ''};
  }

  @media only screen and ${breakpoints.desktop} {
    width: ${({ maxHeight }) => maxHeight}px;
    height: ${({ maxHeight }) => maxHeight}px;
  }
`;

export default NftDetailAsset;
