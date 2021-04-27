import { useCallback, useMemo, useState } from 'react';

import { Nft } from 'types/Nft';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

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
