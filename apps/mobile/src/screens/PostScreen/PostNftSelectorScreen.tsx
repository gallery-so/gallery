import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback } from 'react';
import { View } from 'react-native';

import { NftSelectorHeader } from '~/components/NftSelector/NftSelectorHeader';
import { NftSelectorToolbar } from '~/components/NftSelector/NftSelectorToolbar';
import { NftSelectorWrapper } from '~/components/NftSelector/NftSelectorWrapper';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { NftSelectorLoadingSkeleton } from '~/screens/NftSelectorScreen/NftSelectorLoadingSkeleton';
import { NftSelectorPickerGrid } from '~/screens/NftSelectorScreen/NftSelectorPickerGrid';

export function PostNftSelectorScreen() {
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

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      navigation.navigate('PostComposer', {
        tokenId,
      });
    },
    [navigation]
  );

  const handleSelectNftGroup = useCallback(
    (contractAddress: string) => {
      navigation.navigate('NftSelectorContractScreen', {
        contractAddress: contractAddress,
        page: 'Post',
        ownerFilter: 'Collected',
        fullScreen: true,
      });
    },
    [navigation]
  );
  return (
    <NftSelectorWrapper ownershipTypeFilter={ownershipTypeFilter} isFullscreen>
      <View className="gap-8">
        <NftSelectorHeader title="Select item to post" />
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
            onSelectNftGroup={handleSelectNftGroup}
          />
        </Suspense>
      </View>
    </NftSelectorWrapper>
  );
}
