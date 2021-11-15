import { NftMediaType } from 'components/core/enums';
import { useMemo } from 'react';
import styled from 'styled-components';

import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';
import { getMediaTypeForAssetUrl, getResizedNftImageUrlWithFallback } from 'utils/nft';
import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';

type Props = {
  nft: Nft;
  size: number;
};

function NftPreviewAsset({ nft, size }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();
  const nftAssetComponent = useMemo(() => {
    if (getMediaTypeForAssetUrl(nft.image_url) === NftMediaType.VIDEO) {
      return <StyledVideo src={`${nft.image_url}#t=0.5`} onLoadStart={setContentIsLoaded} preload="metadata"></StyledVideo>;
    }

    return <ImageWithLoading src={getResizedNftImageUrlWithFallback(nft, size)} alt={nft.name} />;
  }
  , [nft, setContentIsLoaded, size]);

  return nftAssetComponent;
}

const StyledVideo = styled.video`
  display: flex;
  width: 100%;
`;

export default NftPreviewAsset;
