import { useCallback, useMemo, useState } from 'react';
import { AvailableChains, chains } from 'shared/utils/chains';

import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
import {
  NetworkChoice,
  NftSelectorSortView,
} from '~/screens/NftSelectorScreen/NftSelectorFilterBottomSheet';

export function useNftSelector() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ownershipTypeFilter, setFilter] = useState<'Collected' | 'Created'>('Collected');
  const [networkFilter, setNetworkFilter] = useState<NetworkChoice>('All Networks');
  const [sortView, setSortView] = useState<NftSelectorSortView>('Recently added');
  const [isDraggableMode, setIsDraggableMode] = useState(false);

  const { syncTokens, syncCreatedTokens, isSyncing, isSyncingCreatedTokens } =
    useSyncTokensActions();

  const availableChains = useMemo(() => {
    return chains
      .filter((chain) => chain.name !== 'All Networks')
      .map((chain) => chain.name as AvailableChains);
  }, []);

  const handleSync = useCallback(async () => {
    if (ownershipTypeFilter === 'Collected') {
      await syncTokens(networkFilter === 'All Networks' ? availableChains : networkFilter);
    }
    if (ownershipTypeFilter === 'Created' && networkFilter !== 'All Networks') {
      await syncCreatedTokens(networkFilter);
    }
  }, [ownershipTypeFilter, networkFilter, syncTokens, availableChains, syncCreatedTokens]);

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
