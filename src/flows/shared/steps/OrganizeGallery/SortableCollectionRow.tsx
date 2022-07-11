import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import CollectionRow from './CollectionRow';
import CollectionRowSettings from './CollectionRowSettings';

type Props = {
  collectionRef: any;
};

function SortableCollectionRow({ collectionRef }: Props) {
  const collection = useFragment(
    graphql`
      fragment SortableCollectionRowFragment on Collection {
        id
        ...CollectionRowSettingsFragment
        ...CollectionRowFragment
      }
    `,
    collectionRef
  );

  const { attributes, listeners, isDragging, setNodeRef, transform, transition } = useSortable({
    id: collection.id,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? '0.2' : '1',
    }),
    [isDragging, transform, transition]
  );

  return (
    <StyledSortableCollectionRow
      ref={setNodeRef}
      id={collection.id}
      active={isDragging}
      // @ts-expect-error force overload
      style={style}
      {...attributes}
      {...listeners}
    >
      <>
        <CollectionRowSettings collectionRef={collection} />
        <CollectionRow collectionRef={collection} />
      </>
    </StyledSortableCollectionRow>
  );
}

const StyledSortableCollectionRow = styled.div`
  &:focus {
    // ok to remove focus here because there it is not functionally 'in focus' for the user
    outline: none;
  }
  cursor: grab;
`;

export default SortableCollectionRow;
