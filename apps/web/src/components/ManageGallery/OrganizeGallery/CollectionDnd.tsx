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
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import keyBy from 'lodash.keyby';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { VStack } from '~/components/core/Spacer/Stack';
import { CollectionDndFragment$key } from '~/generated/CollectionDndFragment.graphql';
import useUpdateGallery from '~/hooks/api/galleries/useUpdateGallery';
import { removeNullValues } from '~/utils/removeNullValues';

import CollectionRowDragging from './CollectionRowDragging';
import CollectionRowWrapper from './CollectionRowWrapper';

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
  onEditCollection: (dbid: string) => void;
};

function CollectionDnd({ galleryRef, onEditCollection }: Props) {
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

      if(!over || !active) {
        return;
      }

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
            <CollectionRowWrapper
              key={collection.id}
              collectionRef={collection}
              onEditCollection={onEditCollection}
            />
          ))}
        </VStack>
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeCollection ? (
          <CollectionRowDragging
            onEditCollection={onEditCollection}
            collectionRef={activeCollection}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default CollectionDnd;
