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

import { Collection } from 'types/Collection';
import CollectionRowWrapper from './CollectionRowWrapper';
import CollectionRowDragging from './CollectionRowDragging';

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

type Props = {
  collections: Collection[];
};

function CollectionDnd({ collections }: Props) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [collectionOrder, setCollectionOrder] = useState(collections);

  const handleSortCollections = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setCollectionOrder((prev) => {
        const oldIndex = prev.findIndex(({ id }) => id === active.id);
        const newIndex = prev.findIndex(({ id }) => id === over?.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (!active) {
      return;
    }

    setActiveId(active.id);
  }, []);

  const activeCollection = useMemo(() => {
    return collectionOrder.find(({ id }) => id === activeId);
  }, [activeId, collectionOrder]);

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
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext
        items={collectionOrder}
        strategy={verticalListSortingStrategy}
      >
        {collectionOrder.map((collection) => (
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
