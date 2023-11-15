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
import styled, { css } from 'styled-components';

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
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import { getImageSizeForColumns } from '~/contexts/collectionEditor/useDndDimensions';
import { StagingAreaFragment$key } from '~/generated/StagingAreaFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';

import OnboardingDialog from '../GalleryOnboardingGuide/OnboardingDialog';
import { useOnboardingDialogContext } from '../GalleryOnboardingGuide/OnboardingDialogContext';
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
  tokensRef: StagingAreaFragment$key;
};

function StagingArea({ tokensRef }: Props) {
  const tokens = useFragment(
    graphql`
      fragment StagingAreaFragment on Token @relay(plural: true) {
        dbid
        ...SortableStagedNftFragment
        ...StagedItemDraggingFragment
      }
    `,
    tokensRef
  );

  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();

  const { editCollectionNameAndNote, collectionIdBeingEdited } = useGalleryEditorContext();
  const {
    name,
    sections,
    collectorsNote,
    activeSectionId,

    updateSections,
    deleteSection,
  } = useCollectionEditorContext();

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // copy the StagedCollectionState locally so that we can temporarily modify it when the user drags items around without affecting the original state and other components that access it
  const [localSections, setLocalSections] = useState(sections);
  useLayoutEffect(() => {
    return setLocalSections(sections);
  }, [sections]);

  const escapedCollectionName = unescape(name ?? '');
  const nonNullTokens = useMemo(() => removeNullValues(tokens), [tokens]);
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);

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
    () => localSections.flatMap((section) => section.items),
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

    const localActiveSection = localSections.find((section) => section.id === activeId.toString());
    if (localActiveSection) {
      return (
        <SectionDragging
          sectionId={activeId.toString()}
          items={localActiveSection.items}
          itemWidth={getImageSizeForColumns(localActiveSection.columns)}
          columns={localActiveSection.columns}
          nftFragmentsKeyedByID={nftFragmentsKeyedByID}
        />
      );
    } else if (activeItem) {
      const sectionOwningItem = sections.find((section) =>
        section.items.some((item) => item.id === activeId)
      );

      const activeItemRef = nftFragmentsKeyedByID[activeItem.id];

      if (!sectionOwningItem || !activeItemRef) {
        return null;
      }

      return (
        <StagedItemDragging
          tokenRef={activeItemRef}
          size={getImageSizeForColumns(sectionOwningItem.columns)}
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
              <HStack gap={8} align="center">
                {step === 2 && (
                  <OnboardingDialog
                    step={step}
                    text={dialogMessage}
                    onNext={nextStep}
                    onClose={handleClose}
                    options={{
                      placement: 'bottom',
                      positionOffset: 20,
                      blinkingPosition: {
                        left: -10,
                      },
                    }}
                  />
                )}
                <VStack>
                  <StyledCollectionName hasName={Boolean(escapedCollectionName)}>
                    {escapedCollectionName || 'Untitled section'}
                  </StyledCollectionName>

                  <BaseM>
                    <Markdown text={collectorsNote} eventContext={contexts.Editor} />
                  </BaseM>
                </VStack>
              </HStack>
            ) : (
              <HStack gap={8} align="center">
                <BaseM color={colors.metal}>Add title and description</BaseM>
                {step === 2 && (
                  <OnboardingDialog
                    step={step}
                    text={dialogMessage}
                    onNext={nextStep}
                    onClose={handleClose}
                    options={{
                      placement: 'bottom',
                      positionOffset: 20,
                      blinkingPosition: {
                        left: -10,
                      },
                    }}
                  />
                )}
              </HStack>
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
              {localSections.map((section) => {
                return (
                  <DroppableSection
                    key={section.id}
                    id={section.id}
                    items={section.items}
                    columns={section.columns}
                  >
                    {/* Handles sorting for items in each section */}
                    <SortableContext items={section.items.map((item) => item.id)}>
                      {section.items.map((item) => {
                        const columns = section.columns;
                        const size = getImageSizeForColumns(columns);
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
  position: relative;

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

const StyledCollectionName = styled(TitleDiatypeM)<{ hasName: boolean }>`
  ${({ hasName }) =>
    !hasName &&
    css`
      font-style: italic;
      color: ${colors.metal};
      font-weight: 400;
    `}
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
