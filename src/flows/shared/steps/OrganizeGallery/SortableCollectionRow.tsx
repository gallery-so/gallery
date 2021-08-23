import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import styled from 'styled-components';
import CollectionRow from './CollectionRow';

type Props = {
  collectionId: string;
};

function SortableCollectionRow({ collectionId }: Props) {
  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: collectionId });

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
      id={collectionId}
      active={isDragging}
      // @ts-expect-error
      style={style}
      {...attributes}
      {...listeners}
    >
      <CollectionRow collectionId={collectionId} />
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
