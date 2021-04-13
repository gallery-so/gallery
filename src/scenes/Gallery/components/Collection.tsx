import colors from 'components/core/colors';
import NftPreview from 'components/NftPreview/NftPreview';
import styled from 'styled-components';
import { Collection } from 'types/Collection';
import { Text } from 'components/core/Text/Text';

type Props = {
  collection: Collection;
  // true to render a separator line above the collection
  showCollectionDivider: boolean;
};

function CollectionView({ collection, showCollectionDivider }: Props) {
  return (
    <StyledCollectionWrapper>
      {showCollectionDivider && <StyledCollectionDivider />}
      <StyledCollectionHeader>
        <StyledCollectionTitle>{collection.title}</StyledCollectionTitle>
        <StyledCollectionDescription>
          {collection.description}
        </StyledCollectionDescription>
      </StyledCollectionHeader>
      <StyledCollectionNfts>
        {collection.nfts.map((nft) => (
          <NftPreview key={nft.id} nft={nft}></NftPreview>
        ))}
      </StyledCollectionNfts>
    </StyledCollectionWrapper>
  );
}

const StyledCollectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledCollectionHeader = styled.div`
  margin-bottom: 10px;
`;
const StyledCollectionTitle = styled(Text)`
  font-size: 16px;
  font-weight: 500;
`;
const StyledCollectionDescription = styled(Text)`
  color: ${colors.gray};
  margin-top: 10px;
`;

const StyledCollectionNfts = styled.div`
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  max-width: 1024px; // TODO: make this responsive - this is shared with header
  column-gap: 80px; // TODO: make this responsive
  row-gap: 80px; // TODO: make this responsive
`;

const StyledCollectionDivider = styled.div`
  border-top: 1px solid ${colors.gray};
  margin: 50px 0;
`;

export default CollectionView;
