import { NftMediaType } from 'components/core/enums';
import { useMemo } from 'react';
import styled from 'styled-components';

import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';
import { getMediaType, getResizedNftImageUrlWithFallback } from 'utils/nft';
import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';

type Props = {
  nft: Nft;
};

function NftPreviewAsset({ nft }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();
  const nftAssetComponent = useMemo(() => {
    if (!nft.animation_url && getMediaType(nft) === NftMediaType.VIDEO) {
      return <StyledVideo src={'https://storage.opensea.io/files/7acbd389bd9bfdd376e428b685e6c15a.mp4'} onLoadStart={setContentIsLoaded}></StyledVideo>;
    }

    return <ImageWithLoading src={getResizedNftImageUrlWithFallback(nft)} alt={nft.name} />;
  }
  , [nft, setContentIsLoaded]);

  return nftAssetComponent;
}

const StyledVideo = styled.video`
  display: flex;
  width: 100%;
`;

export default NftPreviewAsset;
