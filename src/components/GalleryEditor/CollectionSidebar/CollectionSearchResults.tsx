import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useMemo } from 'react';

import { VStack } from '~/components/core/Spacer/Stack';
import { CollectionListItem } from '~/components/GalleryEditor/CollectionSidebar/CollectionListItem';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';

type CollectionSearchResultsProps = {
  searchQuery: string;
};

export function CollectionSearchResults({ searchQuery }: CollectionSearchResultsProps) {
  const { collections, setCollections } = useGalleryEditorContext();

  const collectionList = useMemo(() => Object.values(collections), [collections]);

  const filteredCollections = useMemo(() => {
    if (searchQuery.length === 0) {
      return collectionList;
    }

    return collectionList.filter((collection) =>
      collection.name?.toLocaleLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collectionList, searchQuery]);

  const items = useMemo(() => {
    return Object.values(collections).map((collection) => collection.dbid);
  }, [collections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,

        // This is pretty arbitrary, but seems like a reasonable value
        // https://docs.dndkit.com/api-documentation/sensors/pointer#delay
        tolerance: 50,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!active.id || !over?.id) {
        return;
      }

      setCollections((previousCollections) => {
        const items = Object.keys(previousCollections);

        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        const nextOrder = arrayMove(items, oldIndex, newIndex);

        return nextOrder.reduce((buildingCollections, currentKey) => {
          return { ...buildingCollections, [currentKey]: previousCollections[currentKey] };
        }, {});
      });
    },
    [setCollections]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
        disabled={searchQuery.length > 0}
      >
        <VStack gap={2}>
          {filteredCollections.map((collection) => {
            return <CollectionListItem key={collection.dbid} collectionId={collection.dbid} />;
          })}
        </VStack>
      </SortableContext>
    </DndContext>
  );
}
