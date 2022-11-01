import styled from 'styled-components';

import SortableCollectionRow from './SortableCollectionRow';
import { graphql, useFragment } from 'react-relay';
import { CollectionRowWrapperFragment$key } from '__generated__/CollectionRowWrapperFragment.graphql';

type Props = {
  onEditCollection: (dbid: string) => void;
  collectionRef: CollectionRowWrapperFragment$key;
};

function CollectionRowWrapper({ collectionRef, onEditCollection }: Props) {
  const collection = useFragment(
    graphql`
      fragment CollectionRowWrapperFragment on Collection {
        ...SortableCollectionRowFragment
      }
    `,
    collectionRef
  );

  return (
    <StyledCollectionRowWrapper>
      <SortableCollectionRow onEditCollection={onEditCollection} collectionRef={collection} />
    </StyledCollectionRowWrapper>
  );
}

const StyledCollectionRowWrapper = styled.div`
  position: relative;
`;

export default CollectionRowWrapper;
