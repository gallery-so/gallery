import { useState } from 'react';
import { mockCollectionsLite } from 'mocks/collections';
import styled from 'styled-components';

import Spacer from 'components/core/Spacer/Spacer';
import Header from './Header';
import CollectionRow from './CollectionRow';

function OrganizeCollections() {
  const [collections, setCollections] = useState(mockCollectionsLite(3));

  return (
    <StyledOrganizeCollections>
      <Content>
        <Spacer height={80} />
        <Header />
        <Spacer height={16} />
        <CollectionRows>
          {collections.map((collection) => (
            <CollectionRow
              key={collection.id}
              title="Crypto Punks"
              nfts={collection.nfts}
            />
          ))}
        </CollectionRows>
      </Content>
    </StyledOrganizeCollections>
  );
}

const StyledOrganizeCollections = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Content = styled.div`
  width: 777px;
`;

const CollectionRows = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 24px;
`;

export default OrganizeCollections;
