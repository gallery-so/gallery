import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { noop } from 'shared/utils/noop';

import { NftSelectorHeader } from '~/components/NftSelector/NftSelectorHeader';
import { NftSelectorToolbar } from '~/components/NftSelector/NftSelectorToolbar';
import { NftSelectorWrapper } from '~/components/NftSelector/NftSelectorWrapper';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';
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
  const navigation = useNavigation<RootStackNavigatorProp>();

  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'NftSelectorGalleryEditor'>>();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      navigation.navigate({
        name: 'GalleryEditor',
        params: {
          galleryId: route.params.galleryId,
          stagedTokens: [tokenId],
        },
        merge: true,
      });
    },
    [navigation, route.params.galleryId]
  );

  const searchCriteria = useMemo(
    () => ({
      searchQuery,
      ownerFilter: ownershipTypeFilter,
      networkFilter: networkFilter,
      sortView,
    }),
    [searchQuery, ownershipTypeFilter, networkFilter, sortView]
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
            searchCriteria={searchCriteria}
            onRefresh={sync}
            onSelect={handleSelectNft}
            onSelectNftGroup={noop}
          />
        </Suspense>
      </View>
    </NftSelectorWrapper>
  );
}
