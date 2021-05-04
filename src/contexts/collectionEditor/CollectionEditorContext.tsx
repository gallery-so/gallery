import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Nft } from 'types/Nft';
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
      name: 'test',
      image_url: randomPic(),
      image_preview_url: 'test',
      index: i, // track position in "all nfts" array so it's for dnd to mark it as unselected
    });
  }
  return pics;
}

export type AllNftsState = Nft[];
export type StagedNftsState = Nft[];

export type CollectionEditorState = {
  allNfts: Nft[];
  stagedNfts: Nft[];
};

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  allNfts: randomPics(10),
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
  stageNft: (nft: Nft) => void;
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

  const stageNft = useCallback((nft: Nft) => {
    setStagedNftsState((prev) => [...prev, nft]);
  }, []);

  const unstageNft = useCallback((id: string) => {
    setStagedNftsState((prev) => prev.filter((nft) => nft.id !== id));
  }, []);

  const handleSortNfts = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStagedNftsState((prev) => {
        const oldIndex = prev.findIndex(({ id }) => id === active.id);
        const newIndex = prev.findIndex(({ id }) => id === over?.id);
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
