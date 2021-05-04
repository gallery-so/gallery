import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import { ReactComponent as Settings } from './collection-settings.svg';
import { Nft } from 'types/Nft';

type Props = {
  title: string;
  nfts: Nft[];
};

function CollectionRow({ title, nfts }: Props) {
  return (
    <StyledCollectionRow>
      <Header>
        <Text>{title}</Text>
        <Settings />
      </Header>
      <Body>
        {nfts.map((nft) => (
          <img src={nft.image_url} />
        ))}
      </Body>
    </StyledCollectionRow>
  );
}

const StyledCollectionRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Body = styled.div`
  display: flex;
  column-gap: 24px;
`;

export default CollectionRow;
