import colors from 'components/core/colors';
import NftPreview from 'components/NftPreview/NftPreview';
import styled from 'styled-components';
import { Collection } from 'types/Collection';
import { Text } from 'components/core/Text/Text';

type Props = {
  collection: Collection;
};

function CollectionView({ collection }: Props) {
  return (
    <StyledCollectionWrapper>
      <StyledCollectionHeader>
        <StyledCollectionTitle>{collection.title}</StyledCollectionTitle>
        <StyledCollectionDescription>
          {collection.description}
        </StyledCollectionDescription>
      </StyledCollectionHeader>
      <StyledCollectionNfts>
        {collection.nfts.map((nft) => (
          <NftPreview key={nft.id} nft={nft} collectionId={collection.id} />
        ))}
      </StyledCollectionNfts>
    </StyledCollectionWrapper>
  );
}

const StyledCollectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 96px;
`;

const StyledCollectionHeader = styled.div`
  margin-bottom: 10px;
`;
const StyledCollectionTitle = styled.p`
  margin: 0 0 10px 0;
`;
const StyledCollectionDescription = styled(Text)`
  color: ${colors.gray50};
  margin-top: 10px;
`;

const StyledCollectionNfts = styled.div`
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;

  column-gap: 80px; // TODO: make this responsive
  row-gap: 80px; // TODO: make this responsive
`;

export default CollectionView;
