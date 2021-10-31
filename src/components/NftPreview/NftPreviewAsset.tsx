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

    const isObit = nft.asset_contract?.name?.toLowerCase() === '0bits';

    return <StyledImageWithLoading isObit={isObit} src={getResizedNftImageUrlWithFallback(nft)} alt={nft.name} />;
  }
  , [nft, setContentIsLoaded]);

  return nftAssetComponent;
}

const StyledVideo = styled.video`
  display: flex;
  width: 100%;
`;

const StyledImageWithLoading = styled(ImageWithLoading)<{ isObit: boolean }>`
  background: ${({ isObit }) => isObit ? '#ff5b02' : 'inherit'};
`;

export default NftPreviewAsset;
