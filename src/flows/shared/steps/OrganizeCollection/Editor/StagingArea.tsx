import { memo, useCallback, useState, useMemo } from 'react';
import styled from 'styled-components';

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  defaultDropAnimation,
  DropAnimation,
  LayoutMeasuringStrategy,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import { BaseXL } from 'components/core/Text/Text';

import {
  useCollectionEditorActions,
  useCollectionMetadataState,
  useStagedItemsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import SortableStagedItem from './SortableStagedItem';
import { MENU_HEIGHT } from './EditorMenu';
import StagedItemDragging from './StagedItemDragging';
import { StyledSortableNft } from './SortableStagedNft';

// Width of DND area for each Column # setting
const DND_WIDTHS: Record<number, number> = {
  1: 600,
  2: 800,
  3: 984,
  4: 1020,
  5: 1020,
  6: 1020,
};

// Width of draggable image for each Column # setting
const IMAGE_SIZES: Record<number, number> = {
  1: 400,
  2: 320,
  3: 280,
  4: 207,
  5: 156,
  6: 122,
};

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const layoutMeasuring = { strategy: LayoutMeasuringStrategy.Always };

function StagingArea() {
  const stagedItems = useStagedItemsState();
  const { handleSortNfts } = useCollectionEditorActions();

  const collectionMetadata = useCollectionMetadataState();

  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleSortNfts(event);
    },
    [handleSortNfts]
  );

  // the item being dragged
  const activeItem = useMemo(
    () => stagedItems.find(({ id }) => id === activeId),
    [stagedItems, activeId]
  );

  const columns = collectionMetadata.layout.columns;

  return (
    <StyledStagingArea>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
        layoutMeasuring={layoutMeasuring}
      >
        <SortableContext items={stagedItems}>
          <StyledHeadingWrapper>
            <BaseXL>Your collection</BaseXL>
          </StyledHeadingWrapper>
          <StyledStagedNftContainer width={DND_WIDTHS[columns]}>
            {stagedItems.map((stagedItem) => (
              <SortableStagedItem
                key={stagedItem.id}
                stagedItem={stagedItem}
                size={IMAGE_SIZES[columns]}
              />
            ))}
          </StyledStagedNftContainer>
        </SortableContext>
        <DragOverlay adjustScale dropAnimation={defaultDropAnimationConfig}>
          {activeItem ? (
            <StagedItemDragging stagedItem={activeItem} size={IMAGE_SIZES[columns]} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </StyledStagingArea>
  );
}

const StyledHeadingWrapper = styled.div`
  width: 100%;
  padding: 0 8px;
`;

const StyledStagingArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: 0 auto;

  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px - ${MENU_HEIGHT}px);

  padding: 100px 80px;

  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

type StyledStagedNftContainerProps = {
  width: number;
};

const StyledStagedNftContainer = styled.div<StyledStagedNftContainerProps>`
  display: flex;
  flex-wrap: wrap;

  margin-top: 20px;

  // Limit DnD to 3 columns
  max-width: ${({ width }) => width}px;

  // Safari doesn't support this yet
  // column-gap: 48px;
  // row-gap: 48px;

  // Temporary solution until Safari support
  width: calc(100% + 48px);

  ${StyledSortableNft} * {
    outline: none;
  }
`;

export default memo(StagingArea);
