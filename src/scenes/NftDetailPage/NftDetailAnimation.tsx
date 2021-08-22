import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function NftDetailAnimation({ nft }: Props) {
  return (
    <StyledNftDetailAnimation>
      <StyledIframe src={nft.animation_url}></StyledIframe>
    </StyledNftDetailAnimation>
  );
}

const StyledNftDetailAnimation = styled.div`
  width: 100%;
  height: 100%;
`;
const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export default NftDetailAnimation;
