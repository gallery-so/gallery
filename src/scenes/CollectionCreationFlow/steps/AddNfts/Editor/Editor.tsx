import { memo, useCallback, useState, useMemo } from 'react';
import styled from 'styled-components';

import { FOOTER_HEIGHT } from 'scenes/CollectionCreationFlow/WizardFooter';
import { Subtitle } from 'components/core/Text/Text';

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  defaultDropAnimation,
  DropAnimation,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Nft } from 'types/Nft';
import StagedNftImageDragging from './StagedNftImageDragging';

import StagedNftWrapper from './StagedNftWrapper';

type Props = {
  stagedNfts: Nft[];
  onSortNfts: (event: DragEndEvent) => void;
  onUnstageNft: (id: string) => void;
  handleSelectNft: (index: number, isSelected: boolean) => void;
};

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

function Editor({ stagedNfts, onSortNfts, handleSelectNft }: Props) {
  console.log('editor');
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      onSortNfts(event);
    },
    [onSortNfts]
  );

  const activeNft = useMemo(() => {
    return stagedNfts.find((nft) => nft.id === activeId);
  }, [stagedNfts, activeId]);

  return (
    <StyledEditor>
      <Subtitle size="large">Your collection</Subtitle>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
      >
        <SortableContext items={stagedNfts}>
          <StyledStagedNftContainer>
            {stagedNfts.map((nft) => (
              <StagedNftWrapper
                key={nft.id}
                nft={nft}
                activeId={activeId}
                // TODO: this can be obtained directly in the button?
                handleSelectNft={handleSelectNft}
              />
            ))}
          </StyledStagedNftContainer>
        </SortableContext>
        <DragOverlay
          adjustScale={true}
          dropAnimation={defaultDropAnimationConfig}
        >
          {activeId ? (
            <StagedNftImageDragging nft={activeNft}></StagedNftImageDragging>
          ) : null}
        </DragOverlay>
      </DndContext>
    </StyledEditor>
  );
}

const StyledEditor = styled.div`
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

export default memo(Editor);
