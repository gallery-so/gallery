import styled from 'styled-components';
import ImageWithShimmer from 'components/ImageWithShimmer/ImageWithShimmer';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function NftDetailAudio({ nft }: Props) {
  return (
    <StyledAudioContainer>
      <ImageWithShimmer src={nft.imageUrl} alt={nft.name} />
      <StyledAudio
        controls
        loop
        controlsList="nodownload"
        preload="none"
        autoPlay
        src={nft.animationUrl}
      />
    </StyledAudioContainer>
  );
}

const StyledAudioContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledImage = styled.img`
  width: 100%;
`;

const StyledAudio = styled.audio`
  width: 100%;
  height: 32px;
`;

export default NftDetailAudio;
