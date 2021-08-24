import styled from 'styled-components';

import SortableCollectionRow from './SortableCollectionRow';
import Spacer from 'components/core/Spacer/Spacer';
import CollectionRowSettings from './CollectionRowSettings';
import useCollectionById from 'hooks/api/collections/useCollectionById';

type Props = {
  collectionId: string;
};

function CollectionRowWrapper({ collectionId }: Props) {
  // get the latest collection from the cache, since the parent is using a local
  // (and possibly stale) state of collections to keep track of sort order
  const collection = useCollectionById(collectionId);

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
