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
    // certain assets don't have `image_url` fields populated, such as ones from Foundation
    const assetUrl = (nft.image_url || nft.animation_url) ?? '';

    if (getMediaTypeForAssetUrl(assetUrl) === NftMediaType.VIDEO) {
      return (
        <StyledVideo
          src={`${assetUrl}#t=0.5`}
          onLoadStart={setContentIsLoaded}
          preload="metadata"
        />
      );
    }

    return <ImageWithLoading src={getResizedNftImageUrlWithFallback(nft, size)} alt={nft.name} />;
  }, [nft, setContentIsLoaded, size]);

  return nftAssetComponent;
}

const StyledVideo = styled.video`
  display: flex;
  width: 100%;
`;

export default NftPreviewAsset;
