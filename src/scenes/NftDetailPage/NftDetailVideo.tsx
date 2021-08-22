import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function NftDetailVideo({ nft }: Props) {
  return (
    <StyledVideo
      src={nft.animation_url}
      muted
      autoPlay
      loop
      playsInline
      controls
    />
  );
}

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  border: none;
`;

export default NftDetailVideo;
