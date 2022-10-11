import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import CollectionRow from './CollectionRow';
import CollectionRowSettings from './CollectionRowSettings';
import { SortableCollectionRowFragment$key } from '../../../../__generated__/SortableCollectionRowFragment.graphql';

type Props = {
  onEditCollection: (dbid: string) => void;
  collectionRef: SortableCollectionRowFragment$key;
};

function SortableCollectionRow({ collectionRef, onEditCollection }: Props) {
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
      // @ts-expect-error force overload
      active={isDragging}
      style={style}
    >
      <>
        {/* ensures that the entire collection row is draggable, while the Settings remains clickable (and doesn't activate drag) */}
        <div {...listeners} {...attributes}>
          <CollectionRow collectionRef={collection} />
        </div>
        <CollectionRowSettings onEditCollection={onEditCollection} collectionRef={collection} />
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
