import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import keyBy from 'lodash.keyby';
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { createCollisionDetectionStrategy } from '~/components/GalleryEditor/CollectionEditor/DragAndDrop/createCollisionDetectionStrategy';
import {
  dragEnd,
  dragOver,
} from '~/components/GalleryEditor/CollectionEditor/DragAndDrop/draggingActions';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import { useCollectionEditorContextNew } from '~/contexts/collectionEditor/CollectionEditorContextNew';
import { IMAGE_SIZES } from '~/contexts/collectionEditor/useDndDimensions';
import { StagingAreaNewFragment$key } from '~/generated/StagingAreaNewFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import { removeNullValues } from '~/utils/removeNullValues';
import unescape from '~/utils/unescape';

import DroppableSection from './DragAndDrop/DroppableSection';
import SectionDragging from './DragAndDrop/SectionDragging';
import SortableStagedNft from './SortableStagedNft';
import SortableStagedWhitespace from './SortableStagedWhitespace';
import StagedItemDragging from './StagedItemDragging';

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
  tokensRef: StagingAreaNewFragment$key;
};

function StagingArea({ tokensRef }: Props) {
  const tokens = useFragment(
    graphql`
      fragment StagingAreaNewFragment on Token @relay(plural: true) {
        dbid
        ...SortableStagedNftNewFragment
        ...StagedItemDraggingNewFragment
      }
    `,
    tokensRef
  );

  const { editCollectionNameAndNote, collectionIdBeingEdited } = useGalleryEditorContext();
  const {
    name,
    sections,
    collectorsNote,
    activeSectionId,

    updateSections,
    deleteSection,
  } = useCollectionEditorContextNew();

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // copy the StagedCollectionState locally so that we can temporarily modify it when the user drags items around without affecting the orginal state and other components that access it
  const [localSections, setLocalSections] = useState(sections);
  useLayoutEffect(() => {
    return setLocalSections(sections);
  }, [sections]);

  const escapedCollectionName = unescape(name ?? '');
  const nonNullTokens = useMemo(() => removeNullValues(tokens), [tokens]);
  const sectionIds = useMemo(() => Object.keys(localSections) as string[], [localSections]);

  const recentlyMovedToNewContainer = useRef(false);
  const lastOverId = useRef<UniqueIdentifier | null>(null);

  const collisionDetectionStrategy = useMemo(
    () =>
      createCollisionDetectionStrategy({
        activeId,
        recentlyMovedToNewContainer,
        lastOverId,
        localSections,
      }),
    [activeId, localSections]
  );

  // This function specifically handles the case where a draggable item is dragged to a new container.
  // In order to visually update the layout, we need to update the localStagedCollection state as the item is being dragged.
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      setLocalSections(dragOver(localSections, event));
    },
    [localSections]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const nextSections = dragEnd(localSections, event);

      setLocalSections(nextSections);
      updateSections(nextSections);
    },
    [localSections, updateSections]
  );

  const handleEditNameAndDescription = useCallback(() => {
    if (collectionIdBeingEdited) {
      editCollectionNameAndNote(collectionIdBeingEdited);
    }
  }, [collectionIdBeingEdited, editCollectionNameAndNote]);

  // flatten the collection into a single array of items to easily find the active item
  const allItemsInCollection = useMemo(
    () => Object.keys(localSections).flatMap((sectionId) => localSections[sectionId].items),
    [localSections]
  );

  // The item being dragged
  const activeItem = useMemo(() => {
    return allItemsInCollection.find(({ id }) => id === activeId);
  }, [allItemsInCollection, activeId]);

  const nftFragmentsKeyedByID = useMemo(
    () => keyBy(nonNullTokens, (token) => token.dbid),
    [nonNullTokens]
  );

  const handleBackspacePress = useCallback(() => {
    if (activeSectionId) {
      deleteSection(activeSectionId.toString());
    }
  }, [activeSectionId, deleteSection]);

  useKeyDown('Backspace', handleBackspacePress);

  const draggingOverlay = useMemo(() => {
    if (!activeId) {
      return null;
    }

    if (localSections[activeId.toString()]) {
      return (
        <SectionDragging
          items={localSections[activeId].items}
          itemWidth={IMAGE_SIZES[localSections[activeId].columns]}
          columns={localSections[activeId].columns}
          nftFragmentsKeyedByID={nftFragmentsKeyedByID}
        />
      );
    } else if (activeItem) {
      const sectionOwningItem = Object.values(sections).find((section) =>
        section.items.some((item) => item.id === activeId)
      );

      if (!sectionOwningItem) {
        return null;
      }

      const activeItemRef = nftFragmentsKeyedByID[activeItem.id];

      return (
        <StagedItemDragging
          tokenRef={activeItemRef}
          size={IMAGE_SIZES[sectionOwningItem.columns]}
        />
      );
    }
  }, [activeId, activeItem, localSections, nftFragmentsKeyedByID, sections]);

  const hasNameOrCollectorsNote = name || collectorsNote;
  return (
    <StyledStagingArea gap={20} align="center">
      {collectionIdBeingEdited && (
        <CollectionNameAndDescriptionContainer justify="start" align="center">
          <CollectionNameAndDescriptionBackground
            onClick={handleEditNameAndDescription}
            align="center"
            gap={48}
          >
            {hasNameOrCollectorsNote ? (
              <VStack>
                <TitleDiatypeM>{escapedCollectionName || 'Untitled'}</TitleDiatypeM>

                <BaseM>
                  <Markdown text={collectorsNote}></Markdown>
                </BaseM>
              </VStack>
            ) : (
              <BaseM color={colors.metal}>Add title and description</BaseM>
            )}

            <EditIconContainer>
              <IconContainer
                size="sm"
                variant="stacked"
                icon={
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 13L1.66667 10L10.6667 1H11.3333L13 2.66667V3.33333L4 12.3333L1 13Z"
                      stroke="currentColor"
                      strokeMiterlimit="10"
                    />
                  </svg>
                }
              />
            </EditIconContainer>
          </CollectionNameAndDescriptionBackground>
        </CollectionNameAndDescriptionContainer>
      )}

      <SectionList>
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
              {Object.entries(localSections).map(([sectionId, section]) => {
                return (
                  <DroppableSection
                    key={sectionId}
                    id={sectionId}
                    items={section.items}
                    columns={section.columns}
                  >
                    {/* Handles sorting for items in each section */}
                    <SortableContext items={section.items.map((item) => item.id)}>
                      {section.items.map((item) => {
                        const columns = section.columns;
                        const size = IMAGE_SIZES[columns];
                        const stagedItemRef = nftFragmentsKeyedByID[item.id];

                        if (item.kind === 'token' && stagedItemRef) {
                          return (
                            <SortableStagedNft
                              key={item.id}
                              size={size}
                              mini={columns > 4}
                              tokenRef={stagedItemRef}
                            />
                          );
                        } else {
                          return (
                            <SortableStagedWhitespace key={item.id} id={item.id} size={size} />
                          );
                        }
                      })}
                    </SortableContext>
                  </DroppableSection>
                );
              })}
            </VStack>
          </SortableContext>
          <DragOverlay dropAnimation={dropAnimation}>{draggingOverlay}</DragOverlay>
        </DndContext>
      </SectionList>
    </StyledStagingArea>
  );
}

const EditIconContainer = styled.div`
  opacity: 0;

  transition: opacity 150ms ease-in-out;
`;

const CollectionNameAndDescriptionBackground = styled(HStack)`
  padding: 4px 8px;
  cursor: pointer;

  :hover {
    background-color: ${colors.faint};

    ${EditIconContainer} {
      opacity: 1;
    }
  }
`;

const CollectionNameAndDescriptionContainer = styled(HStack)`
  width: 830px;
`;

const SectionList = styled(VStack)``;

const StyledStagingArea = styled(VStack)`
  height: 100%;
  flex-grow: 1;

  padding: 16px 0;

  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export default memo(StagingArea);
