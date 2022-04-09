import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import CollectionRow from './CollectionRow';

type Props = {
  collectionRef: any;
};

function SortableCollectionRow({ collectionRef }: Props) {
  const collection = useFragment(
    graphql`
      fragment SortableCollectionRowFragment on Collection {
        dbid
        ...CollectionRowFragment
      }
    `,
    collectionRef
  );

  const { attributes, listeners, isDragging, setNodeRef, transform, transition } = useSortable({
    id: collection.dbid,
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
      id={collection.dbid}
      active={isDragging}
      // @ts-expect-error force overload
      style={style}
      {...attributes}
      {...listeners}
    >
      <CollectionRow collectionRef={collection} />
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
