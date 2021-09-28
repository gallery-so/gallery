import breakpoints from 'components/core/breakpoints';
import { NftMediaType } from 'components/core/enums';
import { useMemo } from 'react';
import styled from 'styled-components';

import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';
import { getMediaType } from 'utils/nft';
import NftDetailAnimation from './NftDetailAnimation';
import NftDetailVideo from './NftDetailVideo';
import NftDetailAudio from './NftDetailAudio';

type Props = {
  nft: Nft;
};

function NftDetailAsset({ nft }: Props) {
  const getAssetComponent = useMemo(() => {
    const assetType = getMediaType(nft);
    switch (assetType) {
      case NftMediaType.IMAGE:
        return <ImageWithLoading src={nft.image_url} alt={nft.name} />;
      case NftMediaType.AUDIO:
        return <NftDetailAudio nft={nft} />;
      case NftMediaType.VIDEO:
        return <NftDetailVideo nft={nft} />;
      case NftMediaType.ANIMATION:
        return <NftDetailAnimation nft={nft} />;
      default:
        return <ImageWithLoading src={nft.image_url} alt={nft.name} />;
    }
  }, [nft]);

  return <StyledAssetContainer>{getAssetComponent}</StyledAssetContainer>;
}

const StyledAssetContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;

  @media only screen and ${breakpoints.desktop} {
    width: 600px;
  }
`;

export default NftDetailAsset;
