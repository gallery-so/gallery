import { memo, useCallback, useState, useMemo, useRef, useEffect } from 'react';
import keyBy from 'lodash.keyby';
import styled from 'styled-components';

import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  getFirstCollision,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  DragOverEvent,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';

import {
  useActiveSectionIdState,
  useCollectionEditorActions,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { MENU_WIDTH } from './EditorMenu';
import StagedItemDragging from './StagedItemDragging';
import SortableStagedNft from './SortableStagedNft';
import { isEditModeToken, Section } from '../types';
import { graphql, useFragment } from 'react-relay';
import { StagingAreaFragment$key } from '__generated__/StagingAreaFragment.graphql';
import SortableStagedWhitespace from './SortableStagedWhitespace';
import { removeNullValues } from 'utils/removeNullValues';
import { IMAGE_SIZES } from 'contexts/collectionEditor/useDndDimensions';
import DroppableSection from './DragAndDrop/DroppableSection';
import SectionDragging from './DragAndDrop/SectionDragging';
import useKeyDown from 'hooks/useKeyDown';
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

const layoutMeasuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

type Props = {
  tokensRef: StagingAreaFragment$key;
};

function StagingArea({ tokensRef }: Props) {
  const tokenss = useFragment(
    graphql`
      fragment StagingAreaFragment on Token @relay(plural: true) {
        dbid
        name
        ...SortableStagedNftFragment
        ...StagedItemDraggingFragment
      }
    `,
    tokensRef
  );

  const stagedCollectionState = useStagedCollectionState();

  // copy the StagedCollectionState locally so that we can temporarily modify it when the user drags items around without affecting the orginal state and other components that access it
  const [localStagedCollection, setLocalStagedCollection] = useState(stagedCollectionState);
  useEffect(() => setLocalStagedCollection(stagedCollectionState), [stagedCollectionState]);

  const sectionIds = useMemo(
    () => Object.keys(localStagedCollection) as string[],
    [localStagedCollection]
  );

  const tokens = removeNullValues(tokenss);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const { setStagedCollectionState, reorderTokensWithinSection, reorderSection, deleteSection } =
    useCollectionEditorActions();

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // handle collisions when dragging sections
      if (activeId && activeId in localStagedCollection) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (section) => section.id in localStagedCollection
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (!!overId) {
        if (overId in localStagedCollection) {
          const sectionItems = localStagedCollection[overId].items;

          // If a section is matched and it contains items (columns 'A', 'B', 'C')
          if (sectionItems.length > 0) {
            // Return the closest droppable within that section
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (section) =>
                  section.id !== overId &&
                  sectionItems.map((item) => item.id).includes(section.id as string)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, localStagedCollection]
  );

  const sectionContainsId = (section: Section, id: UniqueIdentifier) => {
    return section.items.find((item) => item.id === id);
  };

  const findSection = useCallback(
    (id: UniqueIdentifier | undefined) => {
      if (!id) {
        return '';
      }
      if (id in localStagedCollection) {
        return id;
      }

      const sectionId = Object.keys(localStagedCollection).find((key) =>
        sectionContainsId(localStagedCollection[key], id)
      );

      if (!sectionId) {
        throw new Error(`Could not find section for active id: ${id}`);
      }

      return sectionId;
    },
    [localStagedCollection]
  );

  // This function specifically handles the case where a draggable item is dragged to a new container.
  // In order to visually update the layout, we need to update the localStagedCollection state as the item is being dragged.
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      const activeId = active?.id;
      const overId = over?.id;

      // Return if the component being dragged is a section not an item, or the target is invalid
      if (!overId || active.id in localStagedCollection) {
        return;
      }

      const overSectionId = findSection(overId);
      const activeSectionId = findSection(activeId);

      // Return if either the original or target section is not found
      if (!overSectionId || !activeSectionId || activeSectionId === overSectionId) {
        return;
      }

      // This is the case where a draggable item is dragged to a new container.
      // We update the local collection state to visually reflect that the item is in a different section.
      // Note on performance: setLocalStagedCollection is only called when the item is dragged to a new container -
      // if the item is continued to be dragged within the new container, this function will not be called.
      setLocalStagedCollection((previous) => {
        const oldSection = previous[activeSectionId];
        const oldSectionItems = oldSection.items;
        const oldSectionItemIndex = oldSectionItems.findIndex(({ id }) => id === activeId);
        const newSection = previous[overSectionId];
        const newSectionItems = newSection.items;
        const newSectionItemIndex = newSectionItems.findIndex(({ id }) => id === overId);

        let newIndex: number;

        if (overId in previous) {
          // if the target is the whole container, drop the item at the end of the container

          newIndex = newSectionItems.length + 1;
        } else {
          newIndex =
            newSectionItemIndex >= 0 ? newSectionItemIndex + 1 : newSectionItems.length + 1;
        }

        recentlyMovedToNewContainer.current = true;
        const updatedOldSectionItems = oldSection.items.filter((item) => item.id !== activeId);
        const updatedNewSectionItems = [
          ...newSection.items.slice(0, newIndex),
          oldSection.items[oldSectionItemIndex],
          ...newSection.items.slice(newIndex, newSection.items.length),
        ];

        return {
          ...previous,
          [activeSectionId]: { ...oldSection, items: updatedOldSectionItems },
          [overSectionId]: { ...newSection, items: updatedNewSectionItems },
        };
      });
    },
    [findSection, localStagedCollection]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;
      if (active.id in localStagedCollection && over?.id) {
        return reorderSection(event);
      }

      const activeSectionId = findSection(active.id);
      const overId = over?.id;
      const overSectionId = findSection(overId);

      if (!activeSectionId || overId == null) {
        setActiveId(null);
        return;
      }

      // Item was dropped over a section
      if (overSectionId) {
        const previousIndex = localStagedCollection[activeSectionId].items.findIndex(
          ({ id }) => id === active.id
        );
        const newIndex = localStagedCollection[overSectionId].items.findIndex(
          ({ id }) => id === overId
        );

        if (recentlyMovedToNewContainer.current) {
          // Item was dropped into a new section, so update the full collection with the local state

          const section = localStagedCollection[activeSectionId];
          const sectionItems = section.items;
          const updatedSectionItems = arrayMove(sectionItems, previousIndex, newIndex);
          const updatedCollection = {
            ...localStagedCollection,
            [activeSectionId]: { ...section, items: updatedSectionItems },
          };
          setStagedCollectionState(updatedCollection);
        } else {
          // Item was dropped into the same section, so just reorder the affected section
          reorderTokensWithinSection(event, overSectionId);
        }
      }

      setActiveId(null);

      recentlyMovedToNewContainer.current = false;
    },
    [
      findSection,
      localStagedCollection,
      reorderSection,
      reorderTokensWithinSection,
      setStagedCollectionState,
    ]
  );

  // flatten the collection into a single array of items to easily find the active item
  const allItemsInCollection = useMemo(
    () =>
      Object.keys(localStagedCollection).flatMap(
        (sectionId) => localStagedCollection[sectionId].items
      ),
    [localStagedCollection]
  );

  // The item being dragged
  const activeItem = useMemo(() => {
    return allItemsInCollection.find(({ id }) => id === activeId);
  }, [allItemsInCollection, activeId]);

  const nftFragmentsKeyedByID = useMemo(() => keyBy(tokens, (token) => token.dbid), [tokens]);

  // fragment ref to the item being dragged
  const activeItemRef = activeId && nftFragmentsKeyedByID[activeId];

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const activeSectionId = useActiveSectionIdState();
  const handleBackspacePress = useCallback(() => {
    if (activeSectionId) {
      const itemIds = stagedCollectionState[activeSectionId]?.items.map(({ id }) => id) ?? [];
      deleteSection(activeSectionId, itemIds);
    }
  }, [activeSectionId, deleteSection, stagedCollectionState]);

  useKeyDown('Backspace', handleBackspacePress);

  return (
    <StyledStagingArea>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={collisionDetectionStrategy}
        measuring={layoutMeasuring}
        onDragOver={handleDragOver}
      >
        {/* Handles sorting for sections */}
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <VStack gap={12}>
            {sectionIds.map((sectionId) => (
              <DroppableSection
                key={sectionId}
                id={sectionId}
                items={localStagedCollection[sectionId].items}
                columns={localStagedCollection[sectionId].columns}
              >
                {/* Handles sorting for items in each section */}
                <SortableContext
                  items={localStagedCollection[sectionId].items.map((item) => item.id)}
                >
                  {localStagedCollection[sectionId].items.map((item) => {
                    const columns = localStagedCollection[sectionId].columns;
                    const size = IMAGE_SIZES[columns];
                    const stagedItemRef = nftFragmentsKeyedByID[item.id];
                    if (isEditModeToken(item) && stagedItemRef) {
                      return (
                        <SortableStagedNft
                          key={item.id}
                          tokenRef={stagedItemRef}
                          size={size}
                          mini={columns > 4}
                        />
                      );
                    }
                    return <SortableStagedWhitespace key={item.id} id={item.id} size={size} />;
                  })}
                </SortableContext>
              </DroppableSection>
            ))}
          </VStack>
        </SortableContext>
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? (
            sectionIds.includes(activeId as string) ? (
              <SectionDragging
                items={localStagedCollection[activeId].items}
                itemWidth={IMAGE_SIZES[localStagedCollection[activeId].columns]}
                columns={localStagedCollection[activeId].columns}
                nftFragmentsKeyedByID={nftFragmentsKeyedByID}
              />
            ) : (
              activeItem && (
                <StagedItemDragging
                  tokenRef={activeItemRef || null}
                  isEditModeToken={isEditModeToken(activeItem)}
                  size={
                    IMAGE_SIZES[
                      findSection(activeId)
                        ? localStagedCollection[findSection(activeId)].columns
                        : 3
                    ]
                  }
                />
              )
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </StyledStagingArea>
  );
}

const StyledStagingArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: calc(100% - ${MENU_WIDTH}px);

  margin: 0 auto;

  height: calc(100vh - ${FOOTER_HEIGHT}px);

  padding: 48px 0px;

  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export default memo(StagingArea);
