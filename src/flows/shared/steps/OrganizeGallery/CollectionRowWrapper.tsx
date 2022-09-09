import styled from 'styled-components';

import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';
import SortableCollectionRow from './SortableCollectionRow';
import { graphql, useFragment } from 'react-relay';
import { CollectionRowWrapperFragment$key } from '__generated__/CollectionRowWrapperFragment.graphql';

type Props = {
  collectionRef: CollectionRowWrapperFragment$key;
};

function CollectionRowWrapper({ collectionRef }: Props) {
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
      <SortableCollectionRow collectionRef={collection} />
      <DeprecatedSpacer height={16} />
    </StyledCollectionRowWrapper>
  );
}

const StyledCollectionRowWrapper = styled.div`
  position: relative;
`;

export default CollectionRowWrapper;
