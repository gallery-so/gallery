import { useCallback, useMemo, useState } from 'react';
import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

import useUpdateGallery from 'hooks/api/galleries/useUpdateGallery';
import CollectionRowWrapper from './CollectionRowWrapper';
import CollectionRowDragging from './CollectionRowDragging';
import { graphql, useFragment } from 'react-relay';
import { CollectionDndFragment$key } from '__generated__/CollectionDndFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const modifiers = [restrictToVerticalAxis, restrictToWindowEdges];

type Props = {
  galleryRef: CollectionDndFragment$key;
  // TODO(Terence): Deal with this. Can we just have all of this in the relay cache?
  sortedCollections: Array<{ id: string }>;
  setSortedCollections: (
    sorter: (previous: Array<{ id: string }>) => Array<{ id: string }>
  ) => void;
};

function CollectionDnd({ galleryRef, sortedCollections, setSortedCollections }: Props) {
  const gallery = useFragment(
    graphql`
      fragment CollectionDndFragment on Gallery {
        dbid
        collections {
          id
          dbid
          ...CollectionRowDraggingFragment
          ...CollectionRowWrapperFragment
        }
      }
    `,
    galleryRef
  );

  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const updateGallery = useUpdateGallery();

  const handleSortCollections = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        let updatedCollections = sortedCollections;
        setSortedCollections((previous) => {
          const oldIndex = previous.findIndex(({ id }) => id === active.id);
          const newIndex = previous.findIndex(({ id }) => id === over?.id);
          updatedCollections = arrayMove(previous, oldIndex, newIndex);
          return updatedCollections;
        });
        void updateGallery(gallery.dbid, updatedCollections);
      }
    },
    [gallery.dbid, setSortedCollections, sortedCollections, updateGallery]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (!active) {
      return;
    }

    setActiveId(active.id);
  }, []);

  const activeCollection = useMemo(
    () => removeNullValues(gallery.collections).find(({ dbid }) => dbid === activeId),
    [activeId, gallery.collections]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleSortCollections(event);
    },
    [handleSortCollections]
  );

  const nonNullCollections = removeNullValues(gallery.collections);

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={closestCenter}
      modifiers={modifiers}
    >
      <SortableContext items={nonNullCollections} strategy={verticalListSortingStrategy}>
        {nonNullCollections.map((collection) => (
          <CollectionRowWrapper key={collection.id} collectionRef={collection} />
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={defaultDropAnimationConfig}>
        {activeCollection ? <CollectionRowDragging collectionRef={activeCollection} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default CollectionDnd;
