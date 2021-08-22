import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Collection } from 'types/Collection';
import CollectionRow from './CollectionRow';

type Props = {
  collection: Collection;
};

function SortableCollectionRow({ collection, ...props }: Props) {
  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: collection.id });

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
      // @ts-expect-error
      style={style}
      {...attributes}
      {...listeners}
    >
      <CollectionRow collection={collection} />
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
