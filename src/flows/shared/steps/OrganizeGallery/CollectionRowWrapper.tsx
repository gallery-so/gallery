import styled from 'styled-components';

import SortableCollectionRow from './SortableCollectionRow';
import Spacer from 'components/core/Spacer/Spacer';
import CollectionRowSettings from './CollectionRowSettings';
import { Collection } from 'types/Collection';

type Props = {
  collection: Collection;
};

function CollectionRowWrapper({ collection }: Props) {
  return (
    <StyledCollectionRowWrapper>
      <CollectionRowSettings collection={collection} />
      <SortableCollectionRow collection={collection} />
      <Spacer height={32}></Spacer>
    </StyledCollectionRowWrapper>
  );
}

const StyledCollectionRowWrapper = styled.div`
  position: relative;
`;

export default CollectionRowWrapper;
