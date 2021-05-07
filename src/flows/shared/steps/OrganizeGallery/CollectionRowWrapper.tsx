import styled from 'styled-components';

import { Collection } from 'types/Collection';
import SortableCollectionRow from './SortableCollectionRow';
import Spacer from 'components/core/Spacer/Spacer';
import CollectionRowSettings from './CollectionRowSettings';

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
