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
import NftImage from './NftImage';

import SortableNft from './SortableNft';

type Props = {
  stagedNfts: Nft[];
  onSortNfts: (event: DragEndEvent) => void;
};

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

function Editor({ stagedNfts, onSortNfts }: Props) {
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
          <NftsContainer>
            {stagedNfts.map((nft) => (
              <SortableNft key={nft.id} nft={nft} activeId={activeId}>
                <NftImage nft={nft}></NftImage>
              </SortableNft>
            ))}
          </NftsContainer>
        </SortableContext>
        <DragOverlay
          adjustScale={true}
          dropAnimation={defaultDropAnimationConfig}
        >
          {activeId ? (
            <NftImage nft={activeNft} isDragging={true}></NftImage>
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

const NftsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 48px;
  row-gap: 48px;

  margin-top: 20px;
`;

export default memo(Editor);
