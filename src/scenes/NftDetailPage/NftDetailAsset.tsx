import breakpoints from 'components/core/breakpoints';
import styled from 'styled-components';

import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function NftDetailAsset({ nft }: Props) {
  return (
    <StyledAssetContainer>
      <StyledImage src={nft.imageUrl}></StyledImage>;
    </StyledAssetContainer>
  );
}

const StyledAssetContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledImage = styled.img`
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    width: 600px;
  }
`;

export default NftDetailAsset;
