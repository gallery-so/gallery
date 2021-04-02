import styled from 'styled-components';
import Link from 'components/core/Link/Link';
import Spacer from 'components/core/Spacer/Spacer';

import NftPreview from './NftPreview';

import { Nft } from 'types/Nft';

type Props = {
  nfts: Nft[];
};

function Body({ nfts }: Props) {
  return (
    <>
      <StyledToggleOptions>
        <StyledToggleOption underlined focused>
          All
        </StyledToggleOption>
        <StyledToggleOption>Collections</StyledToggleOption>
      </StyledToggleOptions>
      <Spacer height={40} />
      <StyledNfts>
        {nfts.map((nft) => (
          <NftPreview key={nft.id} nft={nft} />
        ))}
      </StyledNfts>
    </>
  );
}

const StyledToggleOptions = styled.div`
  display: flex;
`;

const StyledToggleOption = styled(Link)`
  margin-right: 10px;
  margin-left: 10px;
`;

const StyledNfts = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 900px;
`;

export default Body;
