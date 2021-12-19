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

import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import { Collection } from 'types/Collection';
import useUpdateGallery from 'hooks/api/galleries/useUpdateGallery';
import CollectionRowWrapper from './CollectionRowWrapper';
import CollectionRowDragging from './CollectionRowDragging';

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const modifiers = [restrictToVerticalAxis, restrictToWindowEdges];

type Props = {
  galleryId: string;
  sortedCollections: Collection[];
  setSortedCollections: (sorter: (previous: Collection[]) => Collection[]) => void;
};

function CollectionDnd({ galleryId, sortedCollections, setSortedCollections }: Props) {
  const { collections } = useAuthenticatedGallery();
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
        void updateGallery(galleryId, updatedCollections);
      }
    },
    [galleryId, setSortedCollections, sortedCollections, updateGallery]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (!active) {
      return;
    }

    setActiveId(active.id);
  }, []);

  const activeCollection = useMemo(
    () => collections.find(({ id }) => id === activeId),
    [activeId, collections]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleSortCollections(event);
    },
    [handleSortCollections]
  );

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={closestCenter}
      modifiers={modifiers}
    >
      <SortableContext items={sortedCollections} strategy={verticalListSortingStrategy}>
        {sortedCollections.map((collection) => (
          <CollectionRowWrapper key={collection.id} collection={collection} />
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={defaultDropAnimationConfig}>
        {activeCollection ? <CollectionRowDragging collection={activeCollection} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default CollectionDnd;
