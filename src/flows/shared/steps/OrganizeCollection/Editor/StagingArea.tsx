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
  useCollectionSettingsState,
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
import useDndWidth from 'contexts/collectionEditor/useDndWidth';

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.2,
};

const layoutMeasuring = { strategy: LayoutMeasuringStrategy.Always };

type Props = {
  tokensRef: StagingAreaFragment$key;
  stagedItems: StagingItem[];
};

function StagingArea({ tokensRef, stagedItems }: Props) {
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

  const tokens = removeNullValues(tokenss);

  const { handleSortTokens } = useCollectionEditorActions();

  const collectionMetadata = useCollectionMetadataState();

  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleSortTokens(event);
    },
    [handleSortTokens]
  );

  // the item being dragged
  const activeItem = useMemo(
    () => stagedItems.find(({ id }) => id === activeId),
    [stagedItems, activeId]
  );

  const nftFragmentsKeyedByID = useMemo(() => arrayToObjectKeyedById('dbid', tokens), [tokens]);

  // fragment ref to the item being dragged
  const activeItemRef = activeId && nftFragmentsKeyedByID[activeId];

  const columns = collectionMetadata.layout.columns;

  const { PADDING_BETWEEN_STAGED_ITEMS_PX } = useCollectionSettingsState();
  const { itemWidth, dndWidth } = useDndWidth();

  return (
    <StyledStagingArea>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
        layoutMeasuring={layoutMeasuring}
      >
        <SortableContext items={stagedItems}>
          <StyledStagedNftContainer
            width={dndWidth}
            paddingBetweenStagedItems={PADDING_BETWEEN_STAGED_ITEMS_PX}
          >
            {stagedItems.map((stagedItem) => {
              const size = itemWidth;
              const stagedItemRef = nftFragmentsKeyedByID[stagedItem.id];
              if (isEditModeToken(stagedItem) && stagedItemRef) {
                return (
                  <SortableStagedNft
                    key={stagedItem.id}
                    tokenRef={stagedItemRef}
                    size={size}
                    mini={columns > 4}
                  />
                );
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
              tokenRef={activeItemRef}
              isEditModeToken={isEditModeToken(activeItem)}
              size={itemWidth}
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

  padding: 48px 0px;

  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

type StyledStagedNftContainerProps = {
  width: number;
  paddingBetweenStagedItems: number;
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
  width: calc(100% + ${({ paddingBetweenStagedItems }) => paddingBetweenStagedItems}px);

  ${StyledSortableNft} * {
    outline: none;
  }
`;

export default memo(StagingArea);
