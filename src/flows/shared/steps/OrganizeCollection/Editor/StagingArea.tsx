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
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

import { FOOTER_HEIGHT } from 'flows/OnboardingFlow/WizardFooter';
import { Heading } from 'components/core/Text/Text';

import StagedNftImageDragging from './StagedNftImageDragging';
import StagedNftWrapper from './StagedNftWrapper';

import {
  useCollectionEditorActions,
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

function Editor() {
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
    <StyledEditor>
      <Heading>Your collection</Heading>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
      >
        <SortableContext items={stagedNfts}>
          <StyledStagedNftContainer>
            {stagedNfts.map((editModeNft) => (
              <StagedNftWrapper
                key={editModeNft.id}
                editModeNft={editModeNft}
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
