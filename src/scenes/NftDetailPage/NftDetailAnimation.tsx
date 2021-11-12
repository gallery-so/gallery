import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function NftDetailAnimation({ nft }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  return (
    <StyledNftDetailAnimation>
      <StyledIframe src={nft.animation_url} onLoad={setContentIsLoaded} />
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
