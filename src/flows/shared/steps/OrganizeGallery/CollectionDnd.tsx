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
import arrayToObjectKeyedById from 'utils/arrayToObjectKeyedById';

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const modifiers = [restrictToVerticalAxis, restrictToWindowEdges];

type Props = {
  galleryRef: CollectionDndFragment$key;
};

function CollectionDnd({ galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment CollectionDndFragment on Gallery {
        dbid
        collections {
          id
          ...CollectionRowDraggingFragment
          ...CollectionRowWrapperFragment
        }
      }
    `,
    galleryRef
  );

  const nonNullCollections = removeNullValues(gallery.collections);

  const [sortedCollectionIds, setSortedCollectionIds] = useState(() => {
    return nonNullCollections.map((collection) => collection.id);
  });

  const sortedCollections = useMemo(() => {
    const collectionsKeyedById = arrayToObjectKeyedById('id', nonNullCollections);

    return sortedCollectionIds.map((collectionId) => collectionsKeyedById[collectionId]);
  }, [nonNullCollections, sortedCollectionIds]);

  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const updateGallery = useUpdateGallery();

  const handleSortCollections = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        let updatedCollections = sortedCollectionIds;

        setSortedCollectionIds((previous) => {
          const oldIndex = previous.findIndex((id) => id === active.id);
          const newIndex = previous.findIndex((id) => id === over?.id);
          updatedCollections = arrayMove(previous, oldIndex, newIndex);
          return updatedCollections;
        });

        void updateGallery(gallery.dbid, updatedCollections);
      }
    },
    [gallery.dbid, sortedCollectionIds, updateGallery]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    if (!active) {
      return;
    }

    setActiveId(active.id);
  }, []);

  const activeCollection = useMemo(
    () => nonNullCollections.find(({ id }) => id === activeId),
    [activeId, nonNullCollections]
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
