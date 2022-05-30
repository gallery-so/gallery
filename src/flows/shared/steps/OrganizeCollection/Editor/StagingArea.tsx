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

import {
  useCollectionEditorActions,
  useCollectionMetadataState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { MENU_WIDTH } from './EditorMenu';
import StagedItemDragging from './StagedItemDragging';
import SortableStagedNft, { StyledSortableNft } from './SortableStagedNft';
import { isEditModeNft, StagingItem } from '../types';
import { graphql, useFragment } from 'react-relay';
import { StagingAreaFragment$key } from '__generated__/StagingAreaFragment.graphql';
import SortableStagedWhitespace from './SortableStagedWhitespace';
import arrayToObjectKeyedById from 'utils/arrayToObjectKeyedById';
import { PADDING_BETWEEN_STAGED_IMAGES_PX } from './constants';

// Width of draggable image for each Column # setting
const IMAGE_SIZES: Record<number, number> = {
  1: 400,
  2: 320,
  3: 210,
  4: 145,
  5: 110,
  6: 78,
};

function _getDndWidth(numImagesInRow: number) {
  return (
    IMAGE_SIZES[numImagesInRow] * numImagesInRow + PADDING_BETWEEN_STAGED_IMAGES_PX * numImagesInRow
  );
}

// Width of DND area for each Column # setting
const DND_WIDTHS: Record<number, number> = {
  1: _getDndWidth(1),
  2: _getDndWidth(2),
  3: _getDndWidth(3),
  4: _getDndWidth(4),
  5: _getDndWidth(5),
  6: _getDndWidth(6),
};

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const layoutMeasuring = { strategy: LayoutMeasuringStrategy.Always };

type Props = {
  nftsRef: StagingAreaFragment$key;
  stagedItems: StagingItem[];
};

function StagingArea({ nftsRef, stagedItems }: Props) {
  const nfts = useFragment(
    graphql`
      fragment StagingAreaFragment on Nft @relay(plural: true) {
        dbid
        name
        ...SortableStagedNftFragment
        ...StagedItemDraggingFragment
      }
    `,
    nftsRef
  );

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

  const nftFragmentsKeyedByID = useMemo(() => arrayToObjectKeyedById('dbid', nfts), [nfts]);

  // fragment ref to the item being dragged
  const activeItemRef = activeId && nftFragmentsKeyedByID[activeId];

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
          <StyledStagedNftContainer width={DND_WIDTHS[columns]}>
            {stagedItems.map((stagedItem) => {
              const size = IMAGE_SIZES[columns];
              const stagedItemRef = nftFragmentsKeyedByID[stagedItem.id];
              if (isEditModeNft(stagedItem) && stagedItemRef) {
                return <SortableStagedNft key={stagedItem.id} nftRef={stagedItemRef} size={size} />;
              }
              return (
                <SortableStagedWhitespace key={stagedItem.id} id={stagedItem.id} size={size} />
              );
            })}
          </StyledStagedNftContainer>
        </SortableContext>
        <DragOverlay adjustScale dropAnimation={defaultDropAnimationConfig}>
          {activeItem && activeItemRef ? (
            <StagedItemDragging
              nftRef={activeItemRef}
              isEditModeNft={isEditModeNft(activeItem)}
              size={IMAGE_SIZES[columns]}
            />
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

  padding: 48px 80px;

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

  // Limit DnD to 3 columns
  max-width: ${({ width }) => width}px;

  // Safari doesn't support this yet
  // column-gap: 48px;
  // row-gap: 48px;

  // Temporary solution until Safari support
  width: calc(100% + ${PADDING_BETWEEN_STAGED_IMAGES_PX}px);

  ${StyledSortableNft} * {
    outline: none;
  }
`;

export default memo(StagingArea);
