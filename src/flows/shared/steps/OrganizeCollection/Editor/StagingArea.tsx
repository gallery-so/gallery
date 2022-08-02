import { memo, useCallback, useState, useMemo, useRef, useEffect } from 'react';
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
  DragOverEvent,
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
import useDndWidth, { IMAGE_SIZES } from 'contexts/collectionEditor/useDndDimensions';
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
  // const [sections, setSections] = useState(
  //   Object.keys(stagedCollectionState) as UniqueIdentifier[]
  // );

  // const formattedCollection = stagedCollectionState;
  const [formattedCollection, setFormattedCollection] = useState(stagedCollectionState);
  useEffect(() => setFormattedCollection(stagedCollectionState), [stagedCollectionState]);
  const sections = useMemo(
    () => Object.keys(formattedCollection) as UniqueIdentifier[],
    [formattedCollection]
  );

  const tokens = removeNullValues(tokenss);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const {
    setStagedCollectionState,
    reorderTokensWithinSection,
    moveTokenToSection,
    reorderSection,
    addSection,
  } = useCollectionEditorActions();

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
            (section) => section.id in formattedCollection
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
          const sectionItems = formattedCollection[overId].items;

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (sectionItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (section) => section.id !== overId && sectionItems.includes(section.id)
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
    return section.items.find((item) => item.id === id);
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

      const overSection = findSection(overId);
      const activeSection = findSection(active.id);

      if (!overSection || !activeSection) {
        return;
      }

      if (activeSection !== overSection) {
        setFormattedCollection((previous) => {
          const activeItems = previous[activeSection].items;
          const overItems = previous[overSection].items;
          const overIndex = overItems.findIndex(({ id }) => id === overId);
          const activeIndex = activeItems.findIndex(({ id }) => id === active.id);

          let newIndex: number;
          if (overId in previous) {
            newIndex = overItems.length + 1;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top > over.rect.top + over.rect.height;
            const modifier = isBelowOverItem ? 1 : 0;
            newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
          }

          recentlyMovedToNewContainer.current = true;
          return {
            ...previous,
            [activeSection]: {
              ...previous[activeSection],
              items: previous[activeSection].items.filter((item) => item.id !== active.id),
            },
            [overSection]: {
              ...previous[overSection],
              items: [
                ...previous[overSection].items.slice(0, newIndex),
                previous[activeSection].items[activeIndex],
                ...previous[overSection].items.slice(newIndex, previous[overSection].length),
              ],
            },
          };
          // return {};
        });
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

      const activeSection = findSection(active.id);
      const overId = over?.id;
      const overSection = findSection(overId);

      if (!activeSection) {
        setActiveId(null);
        return;
      }
      if (overId == null) {
        setActiveId(null);
        return;
      }

      if (overSection) {
        const activeIndex = formattedCollection[activeSection].items.findIndex(
          ({ id }) => id === active.id
        );
        const overIndex = formattedCollection[overSection].items.findIndex(
          ({ id }) => id === overId
        );

        if (activeIndex !== overIndex) {
          // same container
          reorderTokensWithinSection(event, overSection);
        } else {
          // diff container
          // "commit" dragOver changes
          setStagedCollectionState(formattedCollection);
        }
      }
    },
    [
      findSection,
      formattedCollection,
      reorderSection,
      reorderTokensWithinSection,
      setStagedCollectionState,
    ]
  );

  // the item being dragged
  const activeItem = useMemo(() => {
    // flatten the collection into a single array of items to easily find the active item
    const allItemsInCollection = Object.keys(formattedCollection)
      .map((sectionId) => formattedCollection[sectionId])
      .flatMap((section) => section.items);
    return allItemsInCollection.find(({ id }) => id === activeId);
  }, [formattedCollection, activeId]);

  // const activeSection

  const nftFragmentsKeyedByID = useMemo(() => arrayToObjectKeyedById('dbid', tokens), [tokens]);

  const handleAddSectionClick = useCallback(() => {
    addSection();
  }, [addSection]);

  // fragment ref to the item being dragged
  const activeItemRef = activeId && nftFragmentsKeyedByID[activeId];

  const columns = collectionMetadata.layout.sectionLayout[0].columns;

  const { paddingBetweenItemsPx } = useDndDimensions();
  // const { itemWidth, dndWidth } = useDndWidth();

  const coordinateGetter = multipleContainersCoordinateGetter;

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

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
        {/* Handles sorting for sections */}
        <SortableContext items={sections}>
          {sections.map((sectionId) => (
            <DroppableSection
              key={sectionId}
              id={sectionId}
              label={`Section ${sectionId}`}
              items={Object.keys(formattedCollection[sectionId])}
              scrollable
            >
              {/* Handles sorting for items in each section */}
              <SortableContext items={formattedCollection[sectionId].items}>
                {formattedCollection[sectionId].items.map((item) => {
                  const size = IMAGE_SIZES[formattedCollection[sectionId].columns];
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
          <StyledAddSectionButton onClick={handleAddSectionClick}>
            <TitleDiatypeM color={colors.white}>+</TitleDiatypeM>
          </StyledAddSectionButton>
        </SortableContext>
        <DragOverlay adjustScale dropAnimation={dropAnimation}>
          {activeId ? (
            sections.includes(activeId) ? (
              <SectionDragging
                items={formattedCollection[activeId].items}
                itemWidth={IMAGE_SIZES[formattedCollection[activeId].columns]}
                columns={columns}
                nftFragmentsKeyedByID={nftFragmentsKeyedByID}
                label={`Section ${activeId}`}
              />
            ) : (
              <StagedItemDragging
                tokenRef={activeItemRef}
                isEditModeToken={isEditModeToken(activeItem)}
                // todo fix
                size={IMAGE_SIZES[formattedCollection[findSection(activeId) || ''].columns]}
              />
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
