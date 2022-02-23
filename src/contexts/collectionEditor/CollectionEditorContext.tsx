import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { EditModeNft } from 'flows/shared/steps/OrganizeCollection/types';
import { CollectionLayout } from 'types/Collection';

type CollectionMetadata = {
  layout: CollectionLayout;
};

export type SidebarNftsState = Record<string, EditModeNft>;
export type StagedNftsState = EditModeNft[];
export type CollectionMetadataState = CollectionMetadata;

export type CollectionEditorState = {
  sidebarNfts: SidebarNftsState;
  stagedNfts: StagedNftsState;
  collectionMetadata: CollectionMetadataState;
};

const DEFAULT_COLLECTION_METADATA = { layout: { columns: 3 } };

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  sidebarNfts: {},
  stagedNfts: [],
  collectionMetadata: DEFAULT_COLLECTION_METADATA,
});

export const useSidebarNftsState = (): SidebarNftsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.sidebarNfts;
};

export const useStagedNftsState = (): StagedNftsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.stagedNfts;
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
  stageNfts: (nfts: EditModeNft[]) => void;
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
  const [stagedNftsState, setStagedNftsState] = useState<StagedNftsState>([]);
  const [collectionMetadataState, setCollectionMetadataState] = useState<CollectionMetadataState>(
    DEFAULT_COLLECTION_METADATA
  );

  const collectionEditorState = useMemo(
    () => ({
      sidebarNfts: sidebarNftsState,
      stagedNfts: stagedNftsState,
      collectionMetadata: collectionMetadataState,
    }),
    [sidebarNftsState, stagedNftsState, collectionMetadataState]
  );

  const setSidebarNfts = useCallback((nfts: SidebarNftsState) => {
    setSidebarNftsState(nfts);
  }, []);

  const setNftsIsSelected = useCallback((nftIds: string[], isSelected: boolean) => {
    setSidebarNftsState((previous) => {
      const next = { ...previous };
      for (const nftId of nftIds) {
        const selectedNft = next[nftId];
        next[nftId] = { ...selectedNft, isSelected };
      }

      return next;
    });
  }, []);

  const stageNfts = useCallback((nfts: EditModeNft[]) => {
    setStagedNftsState((previous) => [...previous, ...nfts]);
  }, []);

  const unstageNfts = useCallback((ids: string[]) => {
    setStagedNftsState((previous) =>
      previous.filter((editModeNft) => !ids.includes(editModeNft.id))
    );
  }, []);

  const unstageAllItems = useCallback(() => {
    setStagedNftsState([]);
  }, []);

  const handleSortNfts = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStagedNftsState((previous) => {
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
