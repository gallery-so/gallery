import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

import useUpdateGallery from 'hooks/api/galleries/useUpdateGallery';
import CollectionRowWrapper from './CollectionRowWrapper';
import CollectionRowDragging from './CollectionRowDragging';
import { graphql, useFragment } from 'react-relay';
import { CollectionDndFragment$key } from '__generated__/CollectionDndFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import keyBy from 'lodash.keyby';
import { VStack } from 'components/core/Spacer/Stack';

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.2',
      },
    },
  }),
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

  const nonNullCollections = useMemo(() => {
    return removeNullValues(gallery.collections);
  }, [gallery.collections]);

  const [sortedCollectionIds, setSortedCollectionIds] = useState(() =>
    nonNullCollections.map((collection) => collection.id)
  );

  useEffect(() => {
    setSortedCollectionIds(nonNullCollections.map((collection) => collection.id));
  }, [nonNullCollections]);

  const sortedCollections = useMemo(() => {
    const collectionsKeyedById = keyBy(nonNullCollections, (collection) => collection.id);

    return sortedCollectionIds
      .map((collectionId) => collectionsKeyedById[collectionId])
      .filter((collection) => Boolean(collection));
  }, [nonNullCollections, sortedCollectionIds]);

  const [activeId, setActiveId] = useState<UniqueIdentifier | undefined>(undefined);
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

        void updateGallery(
          gallery.dbid,
          // the `id` field in relay is represented as `Collection:123456`, and we only want the latter half.
          // while we should use `dbid`, this will confuse the DND machine, which expects `id` to exist as a
          // native key on each entity.
          updatedCollections.map((id) => id.split(':')[1])
        );
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

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={closestCenter}
      modifiers={modifiers}
    >
      <SortableContext items={sortedCollections} strategy={verticalListSortingStrategy}>
        <VStack gap={16}>
          {sortedCollections.map((collection) => (
            <CollectionRowWrapper key={collection.id} collectionRef={collection} />
          ))}
        </VStack>
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeCollection ? <CollectionRowDragging collectionRef={activeCollection} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default CollectionDnd;
