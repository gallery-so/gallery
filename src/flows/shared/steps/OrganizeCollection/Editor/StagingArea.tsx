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
import { Heading } from 'components/core/Text/Text';

import {
  useCollectionEditorActions,
  useCollectionMetadataState,
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import StagedNftImageDragging from './StagedNftImageDragging';
import SortableStagedNft, { StyledSortableNft } from './SortableStagedNft';

const DND_WIDTH = 984;

// Width of DND area for each Column # setting
const DND_WIDTHS: Record<number, number> = {
  1: 600,
  2: 800,
  3: 984,
  4: 1160,
  5: 1160,
  6: 1160,
};

// Width of draggable image for each Column # setting
const IMAGE_SIZES: Record<number, number> = {
  1: 400,
  2: 320,
  3: 280,
  4: 240,
  5: 180,
  6: 140,
};

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const layoutMeasuring = { strategy: LayoutMeasuringStrategy.Always };

function StagingArea() {
  const stagedNfts = useStagedNftsState();
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
    [handleSortNfts],
  );

  const activeNft = useMemo(() => stagedNfts.find(({ nft }) => nft.id === activeId), [stagedNfts, activeId]);

  const columns = useMemo(() => collectionMetadata.layout.columns, [collectionMetadata.layout.columns]);
  const dndWidth = useMemo(() => DND_WIDTHS[columns], [columns]);

  return (
    <StyledStagingArea>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
        layoutMeasuring={layoutMeasuring}
      >
        <SortableContext items={stagedNfts}>
          <StyledHeadingWrapper>
            <Heading>Your collection</Heading>
          </StyledHeadingWrapper>
          <StyledStagedNftContainer width={dndWidth}>
            {stagedNfts.map(editModeNft => (
              <SortableStagedNft
                key={editModeNft.id}
                editModeNft={editModeNft}
                size={IMAGE_SIZES[columns]}
              />
            ))}
          </StyledStagedNftContainer>
        </SortableContext>
        <DragOverlay
          adjustScale={true}
          dropAnimation={defaultDropAnimationConfig}
        >
          {activeNft ? <StagedNftImageDragging nft={activeNft.nft} size={IMAGE_SIZES[columns]}/> : null}
        </DragOverlay>
      </DndContext>
    </StyledStagingArea>
  );
}

const StyledHeadingWrapper = styled.div`
  width: 100%;
  padding: 0 24px;
`;

const StyledStagingArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: 0 auto;

  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);

  padding: 100px 80px;

  overflow: scroll;

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

  ${StyledSortableNft} {
    margin: 24px;
  }
  ${StyledSortableNft} * {
    outline: none;
  }
`;

export default memo(StagingArea);
