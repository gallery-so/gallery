import { NftMediaType } from 'components/core/enums';
import { useMemo } from 'react';
import styled from 'styled-components';

import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';
import { getMediaTypeForAssetUrl, getResizedNftImageUrlWithFallback } from 'utils/nft';
import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';

type Props = {
  nft: Nft;
};

function NftPreviewAsset({ nft }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();
  const nftAssetComponent = useMemo(() => {
    if (getMediaTypeForAssetUrl(nft.image_url) === NftMediaType.VIDEO) {
      return <StyledVideo src={nft.image_url} onLoadStart={setContentIsLoaded}></StyledVideo>;
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
