import { memo, useCallback, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';

import {
  CancelDrop,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  Modifiers,
  useDroppable,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  KeyboardCoordinateGetter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { coordinateGetter as multipleContainersCoordinateGetter } from './DragAndDrop/multipleContainersKeyboardCoordinates';

import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';

import {
  useCollectionEditorActions,
  useCollectionMetadataState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { MENU_WIDTH } from './EditorMenu';
import StagedItemDragging from './StagedItemDragging';
import SortableStagedNft, { StyledSortableNft } from './SortableStagedNft';
import { isEditModeToken, StagingItem } from '../types';
import { graphql, useFragment } from 'react-relay';
import { StagingAreaFragment$key } from '__generated__/StagingAreaFragment.graphql';
import SortableStagedWhitespace from './SortableStagedWhitespace';
import arrayToObjectKeyedById from 'utils/arrayToObjectKeyedById';
import { removeNullValues } from 'utils/removeNullValues';
import useDndWidth from 'contexts/collectionEditor/useDndDimensions';
import useDndDimensions from 'contexts/collectionEditor/useDndDimensions';
import DroppableSection from './DragAndDrop/DroppableSection';
import SectionDragging from './DragAndDrop/SectionDragging';
import colors from 'components/core/colors';
import { TitleDiatypeM } from 'components/core/Text/Text';

// const defaultDropAnimationConfig: DropAnimation = {
//   ...defaultDropAnimation,
//   dragSourceOpacity: 0.2,
// };

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
  stagedItems: StagingItem[];
};

function StagingArea({ tokensRef, stagedItems }: Props) {
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
  // const [sections, setSections] = useState(
  //   Object.keys(stagedCollectionState) as UniqueIdentifier[]
  // );
  const sections = useMemo(
    () => Object.keys(stagedCollectionState) as UniqueIdentifier[],
    [stagedCollectionState]
  );
  console.log({ stagedCollectionState });

  const formattedCollection = stagedCollectionState;

  const tokens = removeNullValues(tokenss);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const { reorderTokensWithinSection, reorderSection, addSection } = useCollectionEditorActions();

  const collectionMetadata = useCollectionMetadataState();

  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const sectionIds = useMemo(() => {
    return Object.keys(stagedCollectionState);
    // return stagedCollectionState.map((section) => section.id);
  }, [stagedCollectionState]);
  const isSortingContainer = activeId ? sectionIds.includes(activeId) : false;

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
      if (activeId && activeId in formattedCollection) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in formattedCollection
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

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

        if (overId in formattedCollection) {
          const containerItems = formattedCollection[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id !== overId && containerItems.includes(container.id)
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
    [activeId, formattedCollection]
  );

  const sectionContainsId = (section, id) => {
    return section.find((item) => item.id === id);
  };

  const findSection = useCallback(
    (id: UniqueIdentifier) => {
      if (id in formattedCollection) {
        return id;
      }

      return Object.keys(formattedCollection).find((key) =>
        sectionContainsId(formattedCollection[key], id)
      );
    },
    [formattedCollection]
  );

  const TRASH_ID = 'void';

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      const overId = over?.id;

      if (overId == null || overId === TRASH_ID || active.id in formattedCollection) {
        return;
      }

      const overContainer = findSection(overId);
      const activeContainer = findSection(active.id);

      if (!overContainer || !activeContainer) {
        return;
      }

      if (activeContainer !== overContainer) {
        // setItems((formattedCollection) => {
        //   const activeItems = formattedCollection[activeContainer];
        //   const overItems = formattedCollection[overContainer];
        //   const overIndex = overItems.indexOf(overId);
        //   const activeIndex = activeItems.indexOf(active.id);
        //   let newIndex: number;
        //   if (overId in formattedCollection) {
        //     newIndex = overItems.length + 1;
        //   } else {
        //     const isBelowOverItem =
        //       over &&
        //       active.rect.current.translated &&
        //       active.rect.current.translated.top > over.rect.top + over.rect.height;
        //     const modifier = isBelowOverItem ? 1 : 0;
        //     newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        //   }
        //   recentlyMovedToNewContainer.current = true;
        //   return {
        //     ...formattedCollection,
        //     [activeContainer]: formattedCollection[activeContainer].filter(
        //       (item) => item !== active.id
        //     ),
        //     [overContainer]: [
        //       ...formattedCollection[overContainer].slice(0, newIndex),
        //       formattedCollection[activeContainer][activeIndex],
        //       ...formattedCollection[overContainer].slice(
        //         newIndex,
        //         formattedCollection[overContainer].length
        //       ),
        //     ],
        //   };
        // });
      }
    },
    [findSection, formattedCollection]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;
      if (active.id in formattedCollection && over?.id) {
        return reorderSection(event);
      }
      console.log('over', over);
      const activeContainer = findSection(active.id);
      const overId = over?.id;
      const overContainer = findSection(overId);
      console.log('overContainer', overContainer, 'activeContainer', activeContainer);

      if (overContainer) {
        // we have the container index
        // we have active + over
        // when we drop, we need to update the order of items in the collection
        if (activeContainer === overContainer) {
          // if items are within the same section
          // simply reorder the items within the section, then update the collection
          reorderTokensWithinSection(event, overContainer);
          const section = formattedCollection[overContainer];
          const oldIndex = section.findIndex(({ id }) => id === active.id);
          const newIndex = section.findIndex(({ id }) => id === over?.id);
          const updatedSection = arrayMove(section, oldIndex, newIndex);
          console.log({ updatedSection });
          console.log({ section });
        } else {
          // if items are in different sections
          // swap the items in the sections, then update the collection
        }
        console.log('OVER');
      }
      // handleSortTokens(event);
    },
    [findSection, formattedCollection, reorderSection, reorderTokensWithinSection]
  );

  // the item being dragged
  const activeItem = useMemo(() => {
    const test = Object.keys(formattedCollection)
      .map((sectionId) => formattedCollection[sectionId])
      .flatMap((section) => section);
    console.log({ test });
    return test.find(({ id }) => id === activeId);
  }, [formattedCollection, activeId]);

  console.log({ activeItem });

  const nftFragmentsKeyedByID = useMemo(() => arrayToObjectKeyedById('dbid', tokens), [tokens]);

  const handleAddSectionClick = useCallback(() => {
    addSection();
  }, [addSection]);

  // fragment ref to the item being dragged
  const activeItemRef = activeId && nftFragmentsKeyedByID[activeId];

  const columns = collectionMetadata.layout.sectionLayout[0].columns;

  const { paddingBetweenItemsPx } = useDndDimensions();
  const { itemWidth, dndWidth } = useDndWidth();
  console.log({ columns });
  const coordinateGetter = multipleContainersCoordinateGetter;

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  console.log('sections', { sections });

  return (
    <StyledStagingArea>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={collisionDetectionStrategy}
        layoutMeasuring={layoutMeasuring}
        onDragOver={handleDragOver}
      >
        {/* <SortableContext items={stagedItems}>
          <StyledStagedNftContainer width={dndWidth} paddingBetweenItems={paddingBetweenItemsPx}>
            {stagedItems.map((stagedItem) => {
              const size = itemWidth;
              const stagedItemRef = nftFragmentsKeyedByID[stagedItem.id];
              if (isEditModeToken(stagedItem) && stagedItemRef) {
                return (
                  <SortableStagedNft
                    key={stagedItem.id}
                    tokenRef={stagedItemRef}
                    size={size}
                    mini={columns > 4}
                  />
                );
              }
              return (
                <SortableStagedWhitespace key={stagedItem.id} id={stagedItem.id} size={size} />
              );
            })}
          </StyledStagedNftContainer>
        </SortableContext> */}

        {/* Handles sorting for sections */}
        <SortableContext items={sections}>
          {sections.map((sectionId) => (
            <DroppableSection
              key={sectionId}
              id={sectionId}
              label={`Section ${sectionId}`}
              items={stagedCollectionState[sectionId]}
              scrollable
            >
              {/* Handles sorting for items in each section */}
              <SortableContext items={stagedCollectionState[sectionId]}>
                {stagedCollectionState[sectionId].map(
                  (item) => {
                    const size = itemWidth;
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
                  }

                  // <SortableContext></SortableContext>;
                )}
              </SortableContext>
            </DroppableSection>
          ))}
          <StyledAddSectionButton onClick={handleAddSectionClick}>
            <TitleDiatypeM color={colors.white}>+</TitleDiatypeM>
          </StyledAddSectionButton>
        </SortableContext>
        <DragOverlay adjustScale dropAnimation={dropAnimation}>
          {activeId ? (
            sections.includes(activeId) ? (
              <SectionDragging
                items={stagedCollectionState[activeId]}
                itemWidth={itemWidth}
                columns={columns}
                nftFragmentsKeyedByID={nftFragmentsKeyedByID}
              />
            ) : (
              <StagedItemDragging
                tokenRef={activeItemRef}
                isEditModeToken={isEditModeToken(activeItem)}
                size={itemWidth}
              />
            )
          ) : null}
          {/* {activeItem && activeItemRef ? (
          ) : null} */}
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

type StyledStagedNftContainerProps = {
  width: number;
  paddingBetweenItems: number;
};

const StyledStagedNftContainer = styled.div<StyledStagedNftContainerProps>`
  display: flex;
  flex-wrap: wrap;

  // Limit DnD to 3 columns
  max-width: ${({ width }) => width}px;

  // Safari doesn't support this yet
  // column-gap: 48px;
  // row-gap: 48px;

  // Temporary solution until Safari support
  width: calc(100% + ${({ paddingBetweenItems }) => paddingBetweenItems}px);

  ${StyledSortableNft} * {
    outline: none;
  }
`;

const StyledAddSectionButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  height: 20px;
  width: 20px;
  border: 0;
  color: ${colors.white};
  background-color: ${colors.activeBlue};
  cursor: pointer;
`;

export default memo(StagingArea);
