import { Suspense } from 'react';
import { View } from 'react-native';

import { NftSelectorLoadingSkeleton } from '~/screens/NftSelectorScreen/NftSelectorLoadingSkeleton';
import { NftSelectorPickerGrid } from '~/screens/NftSelectorScreen/NftSelectorPickerGrid';

import { NftSelectorHeader } from './NftSelectorHeader';
import { NftSelectorToolbar } from './NftSelectorToolbar';
import { NftSelectorWrapper } from './NftSelectorWrapper';
import { useNftSelector } from './useNftSelector';

type Props = {
  title: string;
  isFullscreen?: boolean;
  onSelectNft: (tokenId: string) => void;
  onSelectNftGroup: (contractAddress: string) => void;

  headerActions?: React.ReactNode;
  headerChildren?: React.ReactNode;
};

export function NftSelector({
  headerActions,
  headerChildren,
  isFullscreen,
  title,
  onSelectNft,
  onSelectNftGroup,
}: Props) {
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

  return (
    <NftSelectorWrapper ownershipTypeFilter={ownershipTypeFilter} isFullscreen={isFullscreen}>
      <View className="gap-8">
        <NftSelectorHeader title={title} rightButton={headerActions}>
          {headerChildren}
        </NftSelectorHeader>
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
            onSelect={onSelectNft}
            onSelectNftGroup={onSelectNftGroup}
          />
        </Suspense>
      </View>
    </NftSelectorWrapper>
  );
}
