import styled from 'styled-components';
import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function NftDetailAudio({ nft }: Props) {
  return (
    <StyledAudioContainer>
      <ImageWithLoading src={nft.image_url} alt={nft.name} />
      <StyledAudio controls loop controlsList="nodownload" preload="none" src={nft.animation_url} />
    </StyledAudioContainer>
  );
}

const StyledAudioContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 1;
`;

const StyledAudio = styled.audio`
  width: 100%;
  height: 32px;
`;

export default NftDetailAudio;
