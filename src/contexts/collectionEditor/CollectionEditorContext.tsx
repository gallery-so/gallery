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

export type SidebarNftsState = Record<string, EditModeNft>;
export type StagedNftsState = EditModeNft[];

export type CollectionEditorState = {
  sidebarNfts: SidebarNftsState;
  stagedNfts: StagedNftsState;
};

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  sidebarNfts: {},
  stagedNfts: [],
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

type CollectionEditorActions = {
  setSidebarNfts: (nfts: Record<string, EditModeNft>) => void;
  setNftsIsSelected: (nfts: EditModeNft[], isSelected: boolean) => void;
  stageNfts: (nfts: EditModeNft[]) => void;
  unstageNfts: (ids: string[]) => void;
  handleSortNfts: (event: DragEndEvent) => void;
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

  const collectionEditorState = useMemo(
    () => ({
      sidebarNfts: sidebarNftsState,
      stagedNfts: stagedNftsState,
    }),
    [sidebarNftsState, stagedNftsState],
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

  const collectionEditorActions: CollectionEditorActions = useMemo(
    () => ({
      setSidebarNfts,
      setNftsIsSelected,
      stageNfts,
      unstageNfts,
      handleSortNfts,
    }),
    [setSidebarNfts, setNftsIsSelected, stageNfts, unstageNfts, handleSortNfts],
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
