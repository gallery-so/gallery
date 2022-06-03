import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { EditModeToken, StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import { UpdateCollectionTokensInput } from '__generated__/useUpdateCollectionTokensMutation.graphql';
import deduplicateObjectByOpenseaIdAndPreferEarliest from './deduplicateObjectByOpenseaIdAndPreferEarliest';

export type SidebarTokensState = Record<string, EditModeToken>;
export type StagedItemsState = StagingItem[];
export type CollectionMetadataState = Pick<UpdateCollectionTokensInput, 'layout'>;

export type CollectionEditorState = {
  sidebarTokens: SidebarTokensState;
  stagedItems: StagedItemsState;
  collectionMetadata: CollectionMetadataState;
};

const DEFAULT_COLLECTION_METADATA = { layout: { columns: 3, whitespace: [] } };

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  sidebarTokens: {},
  stagedItems: [],
  collectionMetadata: DEFAULT_COLLECTION_METADATA,
});

export const useSidebarTokensState = (): SidebarTokensState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.sidebarTokens;
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
  setSidebarTokens: (tokens: Record<string, EditModeToken>) => void;
  setTokensIsSelected: (tokens: string[], isSelected: boolean) => void;
  stageTokens: (tokens: StagingItem[]) => void;
  unstageTokens: (ids: string[]) => void;
  unstageAllItems: () => void;
  handleSortTokens: (event: DragEndEvent) => void;
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
  const [sidebarTokensState, setSidebarTokensState] = useState<SidebarTokensState>({});
  const [stagedItemsState, setStagedItemsState] = useState<StagedItemsState>([]);
  const [collectionMetadataState, setCollectionMetadataState] = useState<CollectionMetadataState>(
    DEFAULT_COLLECTION_METADATA
  );

  const collectionEditorState = useMemo(
    () => ({
      sidebarTokens: sidebarTokensState,
      stagedItems: stagedItemsState,
      collectionMetadata: collectionMetadataState,
    }),
    [sidebarTokensState, stagedItemsState, collectionMetadataState]
  );

  const setSidebarTokens = useCallback((tokens: SidebarTokensState) => {
    setSidebarTokensState(deduplicateObjectByOpenseaIdAndPreferEarliest(tokens));
  }, []);

  const setTokensIsSelected = useCallback((tokenIds: string[], isSelected: boolean) => {
    setSidebarTokensState((previous) => {
      const next = { ...previous };
      for (const tokenId of tokenIds) {
        const selectedNft = next[tokenId];
        if (selectedNft) {
          next[tokenId] = { ...selectedNft, isSelected };
        }
      }

      return next;
    });
  }, []);

  const stageTokens = useCallback((tokens: StagingItem[]) => {
    setStagedItemsState((previous) => [...previous, ...tokens]);
  }, []);

  const unstageTokens = useCallback((ids: string[]) => {
    setStagedItemsState((previous) =>
      previous.filter((stagingItem) => !ids.includes(stagingItem.id))
    );
  }, []);

  const unstageAllItems = useCallback(() => {
    setStagedItemsState([]);
  }, []);

  const handleSortTokens = useCallback((event: DragEndEvent) => {
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
      setSidebarTokens,
      setTokensIsSelected,
      stageTokens,
      unstageTokens,
      unstageAllItems,
      handleSortTokens,
      incrementColumns,
      decrementColumns,
      setColumns,
    }),
    [
      setSidebarTokens,
      setTokensIsSelected,
      stageTokens,
      unstageTokens,
      unstageAllItems,
      handleSortTokens,
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
