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

import NftDetailNote from './NftDetailNote';

import { useBreakpoint } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import { useContentState } from 'contexts/shimmer/ShimmerContext';

type NftDetailAssetComponentProps = {
  nft: Nft;
  maxHeight: number;
};

function NftDetailAssetComponent({ nft, maxHeight }: NftDetailAssetComponentProps) {
  const assetType = getMediaType(nft);
  const breakpoint = useBreakpoint();

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

  switch (assetType) {
    case NftMediaType.IMAGE:
      return resizableImage;
    case NftMediaType.AUDIO:
      return <NftDetailAudio nft={nft} />;
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
  nft: Nft;
  userOwnsAsset: boolean;
  assetHasNote: boolean;
};

// number that determines a reasonable max height for the displayed NFT
let heightWithoutNavAndFooterGutters: number;

if (typeof window !== 'undefined') {
  heightWithoutNavAndFooterGutters =
    window.screen.availHeight - 2 * (GLOBAL_NAVBAR_HEIGHT + GLOBAL_FOOTER_HEIGHT);
}

function NftDetailAsset({ nft, userOwnsAsset, assetHasNote }: Props) {
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
  const isIframe = getMediaType(nft) === NftMediaType.ANIMATION;
  const shouldEnforceSquareAspectRatio =
    breakpoint === size.desktop ||
    breakpoint === size.tablet ||
    (aspectRatioType === 'square' && !isIframe);

  return (
    <StyledAssetContainer
      maxHeight={maxHeight}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
    >
      <NftDetailAssetComponent nft={nft} maxHeight={maxHeight} />
      {(userOwnsAsset || assetHasNote) && (
        <NftDetailNote
          nftId={nft.id}
          userOwnsAsset={userOwnsAsset}
          nftCollectorsNote={
            nft?.collectors_note ||
            "This is where a collector's note would go. Just testing." /* DELETE ME */
          }
        />
      )}
    </StyledAssetContainer>
  );
}

type AssetContainerProps = {
  maxHeight: number;
  shouldEnforceSquareAspectRatio: boolean;
};

const StyledAssetContainer = styled.div<AssetContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-height: 80vh; /* max height is applied to asset + note now, not just asset */

  ${({ shouldEnforceSquareAspectRatio }) =>
    shouldEnforceSquareAspectRatio ? 'aspect-ratio: 1' : ''};

  @media only screen and ${breakpoints.desktop} {
    // max-width: ${({ maxHeight }) => maxHeight}px;
    width: 100%;
    min-width: ${({ maxHeight }) => maxHeight}px;
    height: ${({ maxHeight }) => maxHeight}px;
  }
`;

export default NftDetailAsset;
