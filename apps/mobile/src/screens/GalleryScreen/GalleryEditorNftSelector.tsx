import { Suspense, useCallback } from 'react';
import { View } from 'react-native';

import { NftSelectorHeader } from '~/components/NftSelector/NftSelectorHeader';
import { NftSelectorToolbar } from '~/components/NftSelector/NftSelectorToolbar';
import { NftSelectorWrapper } from '~/components/NftSelector/NftSelectorWrapper';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { NftSelectorLoadingSkeleton } from '~/screens/NftSelectorScreen/NftSelectorLoadingSkeleton';
import { NftSelectorPickerGrid } from '~/screens/NftSelectorScreen/NftSelectorPickerGrid';

export function GalleryEditorNftSelector() {
  const {
    searchQuery,
    setSearchQuery,
    ownershipTypeFilter,
    setFilter,
    networkFilter,
    setNetworkFilter,
    sortView,
    setSortView,
    sync,
    isSyncing,
    isSyncingCreatedTokens,
  } = useNftSelector();

  const { toggleTokenStaged } = useGalleryEditorActions();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      toggleTokenStaged(tokenId);
    },
    [toggleTokenStaged]
  );

  return (
    <NftSelectorWrapper ownershipTypeFilter={ownershipTypeFilter} isFullscreen>
      <View className="gap-8">
        <NftSelectorHeader title="Select item to add" />
        <NftSelectorToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          ownershipTypeFilter={ownershipTypeFilter}
          setFilter={setFilter}
          networkFilter={networkFilter}
          setNetworkFilter={setNetworkFilter}
          sortView={sortView}
          setSortView={setSortView}
          isSyncing={isSyncing}
          isSyncingCreatedTokens={isSyncingCreatedTokens}
          handleSync={sync}
        />
      </View>
      <View className="flex-grow flex-1 w-full">
        <Suspense fallback={<NftSelectorLoadingSkeleton />}>
          <NftSelectorPickerGrid
            searchCriteria={{
              searchQuery,
              ownerFilter: ownershipTypeFilter,
              networkFilter: networkFilter,
              sortView,
            }}
            onRefresh={sync}
            onSelect={handleSelectNft}
            onSelectNftGroup={() => {}}
          />
        </Suspense>
      </View>
    </NftSelectorWrapper>
  );
}
