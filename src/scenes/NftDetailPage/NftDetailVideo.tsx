import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';
import { getVideoUrl } from 'utils/nft';

type Props = {
  nft: Nft;
};

function NftDetailVideo({ nft }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();
  const assetUrl = useMemo(() => getVideoUrl(nft), [nft]);

  return (
    <StyledVideo
      src={assetUrl}
      muted
      autoPlay
      loop
      playsInline
      controls
      onLoadStart={setContentIsLoaded}
    />
  );
}

const StyledVideo = styled.video`
  width: 100%;
  border: none;
`;

export default NftDetailVideo;
