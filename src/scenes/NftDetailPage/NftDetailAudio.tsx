import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function NftDetailAudio({ nft }: Props) {
  return (
    <StyledAudioContainer>
      <StyledImage src={nft.imageUrl} />
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
`;

const StyledImage = styled.img``;

const StyledAudio = styled.audio`
  width: 100%;
  height: 32px;
`;

export default NftDetailAudio;
