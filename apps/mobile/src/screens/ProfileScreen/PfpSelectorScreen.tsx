import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback } from 'react';
import { View } from 'react-native';

import { NftSelectorHeader } from '~/components/NftSelector/NftSelectorHeader';
import { NftSelectorToolbar } from '~/components/NftSelector/NftSelectorToolbar';
import { NftSelectorWrapper } from '~/components/NftSelector/NftSelectorWrapper';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { NftSelectorLoadingSkeleton } from '../NftSelectorScreen/NftSelectorLoadingSkeleton';
import { NftSelectorPickerGrid } from '../NftSelectorScreen/NftSelectorPickerGrid';
import { useProfilePicture } from '../NftSelectorScreen/useProfilePicture';

export function PfpSelectorScreen() {
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
  const { setProfileImage } = useProfilePicture();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      setProfileImage(tokenId).then(() => {
        navigation.pop();
      });
    },
    [navigation, setProfileImage]
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
    <NftSelectorWrapper ownershipTypeFilter={ownershipTypeFilter}>
      <View className="gap-8">
        <NftSelectorHeader title="Select profile picture" />
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
