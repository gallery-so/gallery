import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';
import { getVideoUrl } from 'utils/nft';

type Props = {
  nft: Nft;
  maxHeight: number;
};

function NftDetailVideo({ nft, maxHeight }: Props) {
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
      maxHeight={maxHeight}
    />
  );
}

const StyledVideo = styled.video<{ maxHeight: number }>`
  width: 100%;
  border: none;

  max-height: ${({ maxHeight }) => maxHeight}px;

  height: 100%;
`;

export default NftDetailVideo;
