import { useCallback, useMemo, useState } from 'react';

import { Nft } from 'types/Nft';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

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

export function useNftEditorAllNfts() {
  const [allNfts, setAllNfts] = useState<Nft[]>(randomPics(10));

  const handleSelectNft = useCallback(
    (nftIndex: number, didSelect: boolean) => {
      setAllNfts((prev) => {
        console.log('handleSelectNft', nftIndex);
        let next = [...prev];
        let selectedNft = next[nftIndex];
        let selectedNftCopy = { ...selectedNft };
        selectedNftCopy.isSelected = didSelect;
        next[nftIndex] = selectedNftCopy;
        console.log(next);
        return next;
      });
    },
    []
  );

  return useMemo(
    () => ({
      allNfts,
      handleSelectNft,
    }),
    [allNfts, handleSelectNft]
  );
}

export default function useNftEditor() {
  // TODO: might wanna lift this up to a context if we wanna avoid prop drilling
  const [stagedNfts, setStagedNfts] = useState<Nft[]>([]);

  const handleStageNft = useCallback((nft: Nft) => {
    setStagedNfts((prev) => [...prev, nft]);
  }, []);

  const handleUnstageNft = useCallback((id: string) => {
    setStagedNfts((prev) => prev.filter((nft) => nft.id !== id));
  }, []);

  const handleSortNfts = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStagedNfts((prev) => {
        const oldIndex = prev.findIndex(({ id }) => id === active.id);
        const newIndex = prev.findIndex(({ id }) => id === over?.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  return useMemo(
    () => ({
      stagedNfts,
      handleStageNft,
      handleUnstageNft,
      handleSortNfts,
    }),
    [stagedNfts, handleStageNft, handleUnstageNft, handleSortNfts]
  );
}
