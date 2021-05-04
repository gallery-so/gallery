import { useState } from 'react';
import { mockCollectionsLite } from 'mocks/collections';

import CollectionRow from './CollectionRow';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import Button from 'components/core/Button/Button';
import { Subtitle, Text } from 'components/core/Text/Text';

function OrganizeCollections() {
  const [collections, setCollections] = useState(mockCollectionsLite(3));

  return (
    <StyledOrganizedCollections>
      <Spacer height={80} />

      <Header>
        <TitleContainer>
          <Subtitle>Organize your Gallery</Subtitle>
        </TitleContainer>
        <OptionsContainer>
          <Text>Preview Gallery</Text>
          <Button type="secondary" text="Add Collection" />
        </OptionsContainer>
      </Header>
      {collections.map((collection) => (
        <CollectionRow
          key={collection.id}
          title="Crypto Punks"
          nfts={collection.nfts}
        />
      ))}
    </StyledOrganizedCollections>
  );
}

const StyledOrganizedCollections = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TitleContainer = styled.div``;

const OptionsContainer = styled.div`
  display: flex;
`;

export default OrganizeCollections;
