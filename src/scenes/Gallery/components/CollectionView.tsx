import colors from 'components/core/colors';
import NftPreview from 'components/NftPreview/NftPreview';
import styled from 'styled-components';
import { Collection } from 'types/Collection';
import { Title, Text } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

type Props = {
  collection: Collection;
};

function CollectionView({ collection }: Props) {
  return (
    <StyledCollectionWrapper>
      <StyledCollectionHeader>
        <Title size="mini">{collection.title}</Title>
        <Spacer height={8} />
        <Text color={colors.gray50}>{collection.description}</Text>
      </StyledCollectionHeader>
      <Spacer height={16} />
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
`;

const StyledCollectionHeader = styled.div`
  display: flex;
  flex-direction: column;
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
