import { useState } from 'react';
import { mockCollectionsLite } from 'mocks/collections';
import styled from 'styled-components';

import Spacer from 'components/core/Spacer/Spacer';
import Header from './Header';
import CollectionDnd from './CollectionDnd';

function OrganizeGallery() {
  const [collections, setCollections] = useState(mockCollectionsLite(4));

  return (
    <StyledOrganizeGallery>
      <Content>
        <Spacer height={80} />
        <Header />
        <Spacer height={16} />
        <CollectionDnd collections={collections}></CollectionDnd>
        <Spacer height={120} />
      </Content>
    </StyledOrganizeGallery>
  );
}

const StyledOrganizeGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Content = styled.div`
  width: 777px;
`;

export default OrganizeGallery;
