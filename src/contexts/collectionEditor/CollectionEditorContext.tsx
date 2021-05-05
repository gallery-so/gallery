import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { EditModeNft, Nft } from 'types/Nft';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

import dummy1 from 'scenes/CollectionCreationFlow/steps/AddNfts/dummy_1.png';
import dummy2 from 'scenes/CollectionCreationFlow/steps/AddNfts/dummy_2.png';
import dummy3 from 'scenes/CollectionCreationFlow/steps/AddNfts/dummy_3.png';

function randomPic() {
  const pics = [dummy1, dummy2, dummy3];
  const index = Math.floor(Math.random() * pics.length);
  return pics[index];
}

function randomPics(n: number) {
  const pics = [];
  for (let i = 0; i < n; i++) {
    pics.push({
      id: `${i}`,
      nft: {
        id: `${i}`,
        name: 'test',
        image_url: randomPic(),
        image_preview_url: 'test', // track position in "all nfts" array so it's for dnd to mark it as unselected
      },
      index: i,
      isSelected: false,
    });
  }
  return pics;
}

export type AllNftsState = EditModeNft[];
export type StagedNftsState = EditModeNft[];

export type CollectionEditorState = {
  allNfts: EditModeNft[];
  stagedNfts: EditModeNft[];
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
  setNftIsSelected: (index: number, isSelected: boolean) => void;
  stageNft: (nft: EditModeNft) => void;
  unstageNft: (id: string) => void;
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
  const [allNftsState, setAllNftsState] = useState<AllNftsState>(
    randomPics(10)
  );
  const [stagedNftsState, setStagedNftsState] = useState<StagedNftsState>([]);

  const collectionEditorState = useMemo(
    () => ({
      allNfts: allNftsState,
      stagedNfts: stagedNftsState,
    }),
    [allNftsState, stagedNftsState]
  );

  const setNftIsSelected = useCallback((index, isSelected) => {
    setAllNftsState((prev) => {
      let next = [...prev];
      let selectedNft = next[index];
      let selectedNftCopy = { ...selectedNft };
      selectedNftCopy.isSelected = isSelected;
      next[index] = selectedNftCopy;
      return next;
    });
  }, []);

  const stageNft = useCallback((nft: EditModeNft) => {
    setStagedNftsState((prev) => [...prev, nft]);
  }, []);

  const unstageNft = useCallback((id: string) => {
    setStagedNftsState((prev) => prev.filter((nft) => nft.nft.id !== id));
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
      setNftIsSelected,
      stageNft,
      unstageNft,
      handleSortNfts,
    }),
    [handleSortNfts, setNftIsSelected, stageNft, unstageNft]
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
