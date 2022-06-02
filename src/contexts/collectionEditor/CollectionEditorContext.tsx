import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { EditModeNft, StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import { UpdateCollectionTokensInput } from '__generated__/useUpdateCollectionTokensMutation.graphql';
import deduplicateObjectByOpenseaIdAndPreferEarliest from './deduplicateObjectByOpenseaIdAndPreferEarliest';

export type SidebarNftsState = Record<string, EditModeNft>;
export type StagedItemsState = StagingItem[];
export type CollectionMetadataState = Pick<UpdateCollectionTokensInput, 'layout'>;

export type CollectionEditorState = {
  sidebarNfts: SidebarNftsState;
  stagedItems: StagedItemsState;
  collectionMetadata: CollectionMetadataState;
};

const DEFAULT_COLLECTION_METADATA = { layout: { columns: 3, whitespace: [] } };

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  sidebarNfts: {},
  stagedItems: [],
  collectionMetadata: DEFAULT_COLLECTION_METADATA,
});

export const useSidebarNftsState = (): SidebarNftsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.sidebarNfts;
};

export const useStagedItemsState = (): StagedItemsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.stagedItems;
};

export const useCollectionMetadataState = (): CollectionMetadataState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.collectionMetadata;
};

type CollectionEditorActions = {
  setSidebarNfts: (nfts: Record<string, EditModeNft>) => void;
  setNftsIsSelected: (nfts: string[], isSelected: boolean) => void;
  stageNfts: (nfts: StagingItem[]) => void;
  unstageNfts: (ids: string[]) => void;
  unstageAllItems: () => void;
  handleSortNfts: (event: DragEndEvent) => void;
  incrementColumns: () => void;
  decrementColumns: () => void;
  setColumns: (columns: number) => void;
};

const CollectionEditorActionsContext = createContext<CollectionEditorActions | undefined>(
  undefined
);

export const useCollectionEditorActions = (): CollectionEditorActions => {
  const context = useContext(CollectionEditorActionsContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorActionsContext without a provider');
  }

  return context;
};

type Props = { children: ReactNode };

const CollectionEditorProvider = memo(({ children }: Props) => {
  const [sidebarNftsState, setSidebarNftsState] = useState<SidebarNftsState>({});
  const [stagedItemsState, setStagedItemsState] = useState<StagedItemsState>([]);
  const [collectionMetadataState, setCollectionMetadataState] = useState<CollectionMetadataState>(
    DEFAULT_COLLECTION_METADATA
  );

  const collectionEditorState = useMemo(
    () => ({
      sidebarNfts: sidebarNftsState,
      stagedItems: stagedItemsState,
      collectionMetadata: collectionMetadataState,
    }),
    [sidebarNftsState, stagedItemsState, collectionMetadataState]
  );

  const setSidebarNfts = useCallback((nfts: SidebarNftsState) => {
    setSidebarNftsState(deduplicateObjectByOpenseaIdAndPreferEarliest(nfts));
  }, []);

  const setNftsIsSelected = useCallback((nftIds: string[], isSelected: boolean) => {
    setSidebarNftsState((previous) => {
      const next = { ...previous };
      for (const nftId of nftIds) {
        const selectedNft = next[nftId];
        if (selectedNft) {
          next[nftId] = { ...selectedNft, isSelected };
        }
      }

      return next;
    });
  }, []);

  const stageNfts = useCallback((nfts: StagingItem[]) => {
    setStagedItemsState((previous) => [...previous, ...nfts]);
  }, []);

  const unstageNfts = useCallback((ids: string[]) => {
    setStagedItemsState((previous) =>
      previous.filter((stagingItem) => !ids.includes(stagingItem.id))
    );
  }, []);

  const unstageAllItems = useCallback(() => {
    setStagedItemsState([]);
  }, []);

  const handleSortNfts = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStagedItemsState((previous) => {
        const oldIndex = previous.findIndex(({ id }) => id === active.id);
        const newIndex = previous.findIndex(({ id }) => id === over?.id);
        return arrayMove(previous, oldIndex, newIndex);
      });
    }
  }, []);

  const incrementColumns = useCallback(() => {
    setCollectionMetadataState((previous) => ({
      ...previous,
      layout: { ...previous.layout, columns: previous.layout.columns + 1 },
    }));
  }, []);

  const decrementColumns = useCallback(() => {
    setCollectionMetadataState((previous) => ({
      ...previous,
      layout: { ...previous.layout, columns: previous.layout.columns - 1 },
    }));
  }, []);

  const setColumns = useCallback((columns: number) => {
    setCollectionMetadataState((previous) => ({
      ...previous,
      layout: { ...previous.layout, columns },
    }));
  }, []);

  const collectionEditorActions: CollectionEditorActions = useMemo(
    () => ({
      setSidebarNfts,
      setNftsIsSelected,
      stageNfts,
      unstageNfts,
      unstageAllItems,
      handleSortNfts,
      incrementColumns,
      decrementColumns,
      setColumns,
    }),
    [
      setSidebarNfts,
      setNftsIsSelected,
      stageNfts,
      unstageNfts,
      unstageAllItems,
      handleSortNfts,
      incrementColumns,
      decrementColumns,
      setColumns,
    ]
  );

  return (
    <CollectionEditorStateContext.Provider value={collectionEditorState}>
      <CollectionEditorActionsContext.Provider value={collectionEditorActions}>
        {children}
      </CollectionEditorActionsContext.Provider>
    </CollectionEditorStateContext.Provider>
  );
});

export default CollectionEditorProvider;
