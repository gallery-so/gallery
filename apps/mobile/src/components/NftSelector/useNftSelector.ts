import { useCallback, useState } from 'react';

import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
import {
  NetworkChoice,
  NftSelectorSortView,
} from '~/screens/NftSelectorScreen/NftSelectorFilterBottomSheet';

export function useNftSelector() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ownershipTypeFilter, setFilter] = useState<'Collected' | 'Created'>('Collected');
  const [networkFilter, setNetworkFilter] = useState<NetworkChoice>('Ethereum');
  const [sortView, setSortView] = useState<NftSelectorSortView>('Recently added');
  const [isDraggableMode, setIsDraggableMode] = useState(false);

  const { syncTokens, syncCreatedTokens, isSyncing, isSyncingCreatedTokens } =
    useSyncTokensActions();

  const handleSync = useCallback(async () => {
    if (ownershipTypeFilter === 'Collected') {
      await syncTokens(networkFilter);
    }
    if (ownershipTypeFilter === 'Created') {
      await syncCreatedTokens(networkFilter);
    }
  }, [ownershipTypeFilter, syncTokens, networkFilter, syncCreatedTokens]);

  return {
    searchQuery,
    setSearchQuery,
    ownershipTypeFilter,
    setFilter,
    networkFilter,
    setNetworkFilter,
    sortView,
    setSortView,
    isDraggableMode,
    setIsDraggableMode,
    sync: handleSync,
    isSyncing,
    isSyncingCreatedTokens,
  };
}
