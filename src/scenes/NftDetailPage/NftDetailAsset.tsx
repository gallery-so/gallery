import breakpoints from 'components/core/breakpoints';
import { NftMediaType } from 'components/core/enums';
import styled from 'styled-components';

import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';
import { getMediaType, getResizedNftImageUrlWithFallback } from 'utils/nft';
import {
  GLOBAL_FOOTER_HEIGHT,
  GLOBAL_NAVBAR_HEIGHT,
} from 'components/core/Page/constants';
import NftDetailAnimation from './NftDetailAnimation';
import NftDetailVideo from './NftDetailVideo';
import NftDetailAudio from './NftDetailAudio';
import NftDetailModel from './NftDetailModel';

type NftDetailAssetComponentProps = {
  nft: Nft;
  maxHeight: number;
};

function NftDetailAssetComponent({
  nft,
  maxHeight,
}: NftDetailAssetComponentProps) {
  const assetType = getMediaType(nft);

  switch (assetType) {
    case NftMediaType.IMAGE:
      return (
        <ImageWithLoading
          src={getResizedNftImageUrlWithFallback(nft, 1200)}
          alt={nft.name}
          widthType="maxWidth"
          heightType="maxHeightScreen"
        />
      );
    case NftMediaType.AUDIO:
      return <NftDetailAudio nft={nft} />;
    case NftMediaType.VIDEO:
      return <NftDetailVideo nft={nft} maxHeight={maxHeight} />;
    case NftMediaType.ANIMATION:
      return <NftDetailAnimation nft={nft} />;
    case NftMediaType.MODEL:
      return <NftDetailModel nft={nft} />;
    default:
      return (
        <ImageWithLoading
          src={getResizedNftImageUrlWithFallback(nft, 1200)}
          alt={nft.name}
          widthType="maxWidth"
          heightType="maxHeightScreen"
        />
      );
  }
}

type Props = {
  nft: Nft;
};

// number that determines a reasonable max height for the displayed NFT
let heightWithoutNavAndFooterGutters: number;

if (typeof window !== 'undefined') {
  heightWithoutNavAndFooterGutters =
    window.screen.availHeight -
    2 * (GLOBAL_NAVBAR_HEIGHT + GLOBAL_FOOTER_HEIGHT);
}

function NftDetailAsset({ nft }: Props) {
  const maxHeight = Math.min(
    heightWithoutNavAndFooterGutters,
    // TODO: this number should be determined by the dimensions of the media itself. once the media is fetched,
    // we should grab its dimensions and set it on the shimmer context. this will allow us to display very large
    // NFTs on very large screens
    600
  );

  return (
    <StyledAssetContainer maxHeight={maxHeight}>
      <NftDetailAssetComponent nft={nft} maxHeight={maxHeight} />
    </StyledAssetContainer>
  );
}

const StyledAssetContainer = styled.div<{ maxHeight: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  aspect-ratio: 1;

  @media only screen and ${breakpoints.desktop} {
    width: ${({ maxHeight }) => maxHeight}px;
    height: ${({ maxHeight }) => maxHeight}px;
  }
`;

export default NftDetailAsset;
