import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { EditModeNft } from 'types/Nft';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export type AllNftsState = EditModeNft[];
export type StagedNftsState = EditModeNft[];

export type CollectionEditorState = {
  allNfts: AllNftsState;
  stagedNfts: StagedNftsState;
};

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  allNfts: [],
  stagedNfts: [],
});

export const useAllNftsState = (): AllNftsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw Error(
      'Attempted to use CollectionEditorStateContext without a provider'
    );
  }
  return context.allNfts;
};

export const useStagedNftsState = (): AllNftsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw Error(
      'Attempted to use CollectionEditorStateContext without a provider'
    );
  }
  return context.stagedNfts;
};

type CollectionEditorActions = {
  setAllNfts: (nfts: EditModeNft[]) => void;
  setNftIsSelected: (index: number, isSelected: boolean) => void;
  setNftsIsSelected: (nfts: EditModeNft[], isSelected: boolean) => void;
  stageNft: (nft: EditModeNft) => void;
  stageNfts: (nfts: EditModeNft[]) => void;
  unstageNft: (id: string) => void;
  unstageNfts: (ids: string[]) => void;
  handleSortNfts: (event: DragEndEvent) => void;
};

const CollectionEditorActionsContext = createContext<
  CollectionEditorActions | undefined
>(undefined);

export const useCollectionEditorActions = (): CollectionEditorActions => {
  const context = useContext(CollectionEditorActionsContext);
  if (!context) {
    throw Error('');
  }
  return context;
};

type Props = { children: ReactNode };

const CollectionEditorProvider = memo(({ children }: Props) => {
  const [allNftsState, setAllNftsState] = useState<AllNftsState>([]);
  const [stagedNftsState, setStagedNftsState] = useState<StagedNftsState>([]);

  const collectionEditorState = useMemo(
    () => ({
      allNfts: allNftsState,
      stagedNfts: stagedNftsState,
    }),
    [allNftsState, stagedNftsState]
  );

  const setAllNfts = useCallback((nfts: EditModeNft[]) => {
    setAllNftsState(nfts);
  }, []);

  const setNftsIsSelected = useCallback(
    (nfts: EditModeNft[], isSelected: boolean) => {
      setAllNftsState((prev) => {
        let next = [...prev];
        nfts.forEach((nft) => {
          let selectedNft = next[nft.index];
          let selectedNftCopy = { ...selectedNft };
          selectedNftCopy.isSelected = isSelected;
          next[nft.index] = selectedNftCopy;
        });
        return next;
      });
    },
    []
  );

  const setNftIsSelected = useCallback((index, isSelected) => {
    console.log('setNftIsSelected');
    setAllNftsState((prev) => {
      let next = [...prev];
      let selectedNft = next[index];
      let selectedNftCopy = { ...selectedNft };
      selectedNftCopy.isSelected = isSelected;
      next[index] = selectedNftCopy;
      return next;
    });
  }, []);

  const stageNfts = useCallback((nfts: EditModeNft[]) => {
    setStagedNftsState((prev) => [...prev, ...nfts]);
  }, []);

  const stageNft = useCallback((nft: EditModeNft) => {
    setStagedNftsState((prev) => [...prev, nft]);
  }, []);

  const unstageNft = useCallback((id: string) => {
    setStagedNftsState((prev) =>
      prev.filter((editModeNft) => editModeNft.nft.id !== id)
    );
  }, []);

  const unstageNfts = useCallback((ids: string[]) => {
    setStagedNftsState((prev) =>
      prev.filter((editModeNft) => ids.indexOf(editModeNft.id) < 0)
    );
  }, []);

  const handleSortNfts = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStagedNftsState((prev) => {
        const oldIndex = prev.findIndex(({ nft }) => nft.id === active.id);
        const newIndex = prev.findIndex(({ nft }) => nft.id === over?.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const collectionEditorActions: CollectionEditorActions = useMemo(
    () => ({
      setAllNfts,
      setNftIsSelected,
      setNftsIsSelected,
      stageNft,
      stageNfts,
      unstageNft,
      unstageNfts,
      handleSortNfts,
    }),
    [
      setAllNfts,
      setNftIsSelected,
      setNftsIsSelected,
      stageNft,
      stageNfts,
      unstageNft,
      unstageNfts,
      handleSortNfts,
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
