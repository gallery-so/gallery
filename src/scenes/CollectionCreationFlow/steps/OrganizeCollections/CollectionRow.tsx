import { useMemo } from 'react';
import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import { ReactComponent as Settings } from './collection-settings.svg';
import { Nft } from 'types/Nft';
import colors from 'components/core/colors';

type Props = {
  title: string;
  nfts: Nft[];
};

function CollectionRow({ title, nfts }: Props) {
  const displayedNfts = useMemo(() => nfts.slice(0, 4), [nfts]);

  return (
    <StyledCollectionRow>
      <Header>
        <Text>{title}</Text>
        <Settings />
      </Header>
      <Body>
        {displayedNfts.map((nft) => (
          <LargeNftPreview src={nft.image_url} />
        ))}
      </Body>
    </StyledCollectionRow>
  );
}

const StyledCollectionRow = styled.div`
  display: flex;
  flex-direction: column;

  width: 776px;
  padding: 32px;

  border: 1px solid ${colors.gray50};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Body = styled.div`
  display: flex;
  column-gap: 24px;
`;

const LargeNftPreview = styled.img`
  width: 160px;
  height: 160px;
`;

export default CollectionRow;
