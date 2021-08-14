import breakpoints from 'components/core/breakpoints';
import { NftMediaType } from 'components/core/enums';
import { useMemo } from 'react';
import styled from 'styled-components';

import NftDetailAnimation from './NftDetailAnimation';
import NftDetailVideo from './NftDetailVideo';
import NftDetailAudio from './NftDetailAudio';
import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

const getMediaType = (nft: Nft) => {
  if (!nft.animationUrl) {
    return NftMediaType.IMAGE;
  }

  const animationUrlFiletype = nft.animationUrl.split('.').pop();

  switch (animationUrlFiletype) {
    case 'mp4':
      return NftMediaType.VIDEO;
    case 'mp3':
      return NftMediaType.AUDIO;
    case 'html':
      return NftMediaType.ANIMATION;
    default:
      return NftMediaType.IMAGE;

    // TODO: add more nuanced ways of checking beyond file extension
  }
};

function NftDetailAsset({ nft }: Props) {
  const getAssetComponent = useMemo(() => {
    const assetType = getMediaType(nft);
    switch (assetType) {
      case NftMediaType.IMAGE:
        return <ImageWithLoading src={nft.imageUrl} alt={nft.name} />;
      case NftMediaType.AUDIO:
        return <NftDetailAudio nft={nft} />;
      case NftMediaType.VIDEO:
        return <NftDetailVideo nft={nft} />;
      case NftMediaType.ANIMATION:
        return <NftDetailAnimation nft={nft} />;
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
