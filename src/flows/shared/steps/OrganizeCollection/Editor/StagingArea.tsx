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

import StagedNftImageDragging from './StagedNftImageDragging';
import SortableStagedNft from './SortableStagedNft';

import {
  useCollectionEditorActions,
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const layoutMeasuring = { strategy: LayoutMeasuringStrategy.Always };

function StagingArea() {
  const stagedNfts = useStagedNftsState();
  const { handleSortNfts } = useCollectionEditorActions();

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

  const activeNft = useMemo(() => {
    return stagedNfts.find(({ nft }) => nft.id === activeId);
  }, [stagedNfts, activeId]);

  return (
    <StyledStagingArea>
      <Heading>Your collection</Heading>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
        layoutMeasuring={layoutMeasuring}
      >
        <SortableContext items={stagedNfts}>
          <StyledStagedNftContainer>
            {stagedNfts.map((editModeNft) => (
              <SortableStagedNft
                key={editModeNft.id}
                nft={editModeNft.nft}
                index={editModeNft.index}
              />
            ))}
          </StyledStagedNftContainer>
        </SortableContext>
        <DragOverlay
          adjustScale={true}
          dropAnimation={defaultDropAnimationConfig}
        >
          {activeNft ? <StagedNftImageDragging nft={activeNft.nft} /> : null}
        </DragOverlay>
      </DndContext>
    </StyledStagingArea>
  );
}

const StyledStagingArea = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);

  padding: 100px 80px;

  overflow: scroll;
`;

const StyledStagedNftContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 48px;
  row-gap: 48px;

  margin-top: 20px;
`;

export default memo(StagingArea);
