import colors from 'components/core/colors';
import NftPreview from 'components/NftPreview/NftPreview';
import styled from 'styled-components';
import { Collection } from 'types/Collection';
import { Text } from 'components/core/Text/Text';
import breakpoints from 'components/core/breakpoints';

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
          <NftPreview
            key={nft.id}
            nft={nft}
            collectionId={collection.id}
          ></NftPreview>
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

const COLLECTION_WRAPPER_WIDTH = {
  mobile: '288px',
  tablet: '740px',
  desktop: '1024px',
};

const StyledCollectionNfts = styled.div`
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;

  @media only screen and ${breakpoints.mobile} {
    max-width: ${COLLECTION_WRAPPER_WIDTH.mobile};
  }
  @media only screen and ${breakpoints.tablet} {
    max-width: ${COLLECTION_WRAPPER_WIDTH.tablet};
  }
  @media only screen and ${breakpoints.desktop} {
    max-width: ${COLLECTION_WRAPPER_WIDTH.desktop};
  }

  column-gap: 80px; // TODO: make this responsive
  row-gap: 80px; // TODO: make this responsive
`;

export default CollectionView;
