import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function NftDetailAudio({ nft }: Props) {
  return (
    <>
      <StyledAudio src={nft.animationUrl}></StyledAudio>
    </>
  );
}

const StyledAudio = styled.audio`
  width: 100%;
  height: 100%;
  border: none;
`;

export default NftDetailAudio;
