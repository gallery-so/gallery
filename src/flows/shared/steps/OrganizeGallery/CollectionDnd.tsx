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
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

import CollectionRowWrapper from './CollectionRowWrapper';
import CollectionRowDragging from './CollectionRowDragging';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import { Collection } from 'types/Collection';

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const modifiers = [restrictToVerticalAxis, restrictToWindowEdges];

type Props = {
  sortedCollections: Collection[];
  setSortedCollections: (sorter: (prev: Collection[]) => Collection[]) => void;
};

function CollectionDnd({ sortedCollections, setSortedCollections }: Props) {
  const { collections } = useAuthenticatedGallery();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  const handleSortCollections = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        setSortedCollections((prev) => {
          const oldIndex = prev.findIndex(({ id }) => id === active.id);
          const newIndex = prev.findIndex(({ id }) => id === over?.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    },
    [setSortedCollections]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (!active) {
      return;
    }

    setActiveId(active.id);
  }, []);

  const activeCollection = useMemo(() => {
    return collections.find(({ id }) => id === activeId);
  }, [activeId, collections]);

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
      <SortableContext
        items={sortedCollections}
        strategy={verticalListSortingStrategy}
      >
        {sortedCollections.map((collection) => (
          <CollectionRowWrapper key={collection.id} collection={collection} />
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={defaultDropAnimationConfig}>
        {activeCollection ? (
          <CollectionRowDragging collection={activeCollection} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
export default CollectionDnd;
