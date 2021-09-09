import styled from 'styled-components';

import Spacer from 'components/core/Spacer/Spacer';
import { Collection } from 'types/Collection';
import SortableCollectionRow from './SortableCollectionRow';
import CollectionRowSettings from './CollectionRowSettings';

type Props = {
  collection: Collection;
};

function CollectionRowWrapper({ collection }: Props) {
  return (
    <StyledCollectionRowWrapper>
      <CollectionRowSettings collection={collection} />
      <SortableCollectionRow collection={collection} />
      <Spacer height={32} />
    </StyledCollectionRowWrapper>
  );
}

const StyledCollectionRowWrapper = styled.div`
  position: relative;
`;

export default CollectionRowWrapper;
