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

import dummy1 from './dummy_1.png';
import dummy2 from './dummy_2.png';
import dummy3 from './dummy_3.png';

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

const AllNftsStateContext = createContext<AllNftsState>(randomPics(10));

export const useAllNftsState = (): AllNftsState => {
  const context = useContext(AllNftsStateContext);
  if (!context) {
    throw Error('Attempted to use AllNftsStateContext without a provider');
  }
  return context;
};

type AllNftsActions = {
  setNftIsSelected: (index: number, isSelected: boolean) => void;
};

const AllNftsActionsContext = createContext<AllNftsActions | undefined>(
  undefined
);

export const useAllNftsActions = (): AllNftsActions => {
  const context = useContext(AllNftsActionsContext);
  if (!context) {
    throw Error('');
  }
  return context;
};

type Props = { children: ReactNode };

const CollectionEditorContext = memo(({ children }: Props) => {
  const [allNftsState, setAllNftsState] = useState<AllNftsState>(
    randomPics(10)
  );

  const setNftIsSelected = useCallback((index, isSelected) => {
    setAllNftsState((prev) => {
      console.log('handleSelectNft', index);
      // let selectedNft = prev.find(nft => nft.id === id);
      let next = [...prev];
      let selectedNft = next[index];
      let selectedNftCopy = { ...selectedNft };
      selectedNftCopy.isSelected = isSelected;
      next[index] = selectedNftCopy;
      console.log(next);
      return next;
    });
  }, []);

  const allNftsActions: AllNftsActions = useMemo(() => ({ setNftIsSelected }), [
    setNftIsSelected,
  ]);

  return (
    <AllNftsStateContext.Provider value={allNftsState}>
      <AllNftsActionsContext.Provider value={allNftsActions}>
        {children}
      </AllNftsActionsContext.Provider>
    </AllNftsStateContext.Provider>
  );
});
