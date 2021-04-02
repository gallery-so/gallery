import styled from 'styled-components';

import NftPreview from 'components/NftPreview/NftPreview';
import Spacer from 'components/core/Spacer/Spacer';
import LayoutToggle from './LayoutToggle';

import { Nft } from 'types/Nft';
import useQuery from 'utils/query';

type Props = {
  nfts: Nft[];
};

function Body({ nfts }: Props) {
  const isCollectionsView = useQuery('view') === 'collections';

  return (
    <>
      <LayoutToggle isCollectionsView={isCollectionsView} />
      <Spacer height={40} />
      <StyledNfts>
        {nfts.map((nft) => (
          <NftPreview key={nft.id} nft={nft} />
        ))}
      </StyledNfts>
    </>
  );
}

const StyledNfts = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 900px;
`;

export default Body;
