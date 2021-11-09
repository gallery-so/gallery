import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
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

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  sidebarNfts: {},
  stagedNfts: [],
  collectionMetadata: { layout: { columns: 3 } },
});

export const useSidebarNftsState = (): SidebarNftsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error(
      'Attempted to use CollectionEditorStateContext without a provider',
    );
  }

  return context.sidebarNfts;
};

export const useStagedNftsState = (): StagedNftsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error(
      'Attempted to use CollectionEditorStateContext without a provider',
    );
  }

  return context.stagedNfts;
};

export const useCollectionMetadataState = (): CollectionMetadataState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error(
      'Attempted to use CollectionEditorStateContext without a provider',
    );
  }

  return context.collectionMetadata;
};

type CollectionEditorActions = {
  setSidebarNfts: (nfts: Record<string, EditModeNft>) => void;
  setNftsIsSelected: (nfts: EditModeNft[], isSelected: boolean) => void;
  stageNfts: (nfts: EditModeNft[]) => void;
  unstageNfts: (ids: string[]) => void;
  handleSortNfts: (event: DragEndEvent) => void;
  incrementColumns: () => void;
  decrementColumns: () => void;
};

const CollectionEditorActionsContext = createContext<
CollectionEditorActions | undefined
>(undefined);

export const useCollectionEditorActions = (): CollectionEditorActions => {
  const context = useContext(CollectionEditorActionsContext);
  if (!context) {
    throw new Error(
      'Attempted to use CollectionEditorActionsContext without a provider',
    );
  }

  return context;
};

type Props = { children: ReactNode };

const CollectionEditorProvider = memo(({ children }: Props) => {
  const [sidebarNftsState, setSidebarNftsState] = useState<SidebarNftsState>(
    {},
  );
  const [stagedNftsState, setStagedNftsState] = useState<StagedNftsState>([]);
  const [collectionMetadataState, setCollectionMetadataState] = useState<CollectionMetadataState>({ layout: { columns: 3 } });

  const collectionEditorState = useMemo(
    () => ({
      sidebarNfts: sidebarNftsState,
      stagedNfts: stagedNftsState,
      collectionMetadata: collectionMetadataState,
    }),
    [sidebarNftsState, stagedNftsState, collectionMetadataState],
  );

  const setSidebarNfts = useCallback((nfts: SidebarNftsState) => {
    setSidebarNftsState(nfts);
  }, []);

  const setNftsIsSelected = useCallback(
    (nfts: EditModeNft[], isSelected: boolean) => {
      setSidebarNftsState(previous => {
        const next = { ...previous };
        for (const nft of nfts) {
          const selectedNft = next[nft.id];
          next[nft.id] = { ...selectedNft, isSelected };
        }

        return next;
      });
    },
    [],
  );

  const stageNfts = useCallback((nfts: EditModeNft[]) => {
    setStagedNftsState(previous => {
      const ids = previous.map(({ id }) => id);
      const stagedNfts = Object.fromEntries(ids.map(key => [key, true]));

      const nftsNotYetStaged = nfts.filter(({ id }) => !stagedNfts[id]);

      return [...previous, ...nftsNotYetStaged];
    });
  }, []);

  const unstageNfts = useCallback((ids: string[]) => {
    const idsMap = Object.fromEntries(ids.map(key => [key, true]));

    setStagedNftsState(previous =>
      previous.filter(editModeNft => !idsMap[editModeNft.id]),
    );
  }, []);

  const handleSortNfts = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStagedNftsState(previous => {
        const oldIndex = previous.findIndex(({ nft }) => nft.id === active.id);
        const newIndex = previous.findIndex(({ nft }) => nft.id === over?.id);
        return arrayMove(previous, oldIndex, newIndex);
      });
    }
  }, []);

  const incrementColumns = useCallback(() => {
    setCollectionMetadataState(previous => ({
      ...previous,
      layout: { ...previous.layout, columns: previous.layout.columns + 1 },
    }));
  }, []);

  const decrementColumns = useCallback(() => {
    setCollectionMetadataState(previous => ({
      ...previous,
      layout: { ...previous.layout, columns: previous.layout.columns - 1 },
    }));
  }, []);

  const collectionEditorActions: CollectionEditorActions = useMemo(
    () => ({
      setSidebarNfts,
      setNftsIsSelected,
      stageNfts,
      unstageNfts,
      handleSortNfts,
      incrementColumns,
      decrementColumns,
    }),
    [setSidebarNfts, setNftsIsSelected, stageNfts, unstageNfts, handleSortNfts, incrementColumns, decrementColumns],
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
