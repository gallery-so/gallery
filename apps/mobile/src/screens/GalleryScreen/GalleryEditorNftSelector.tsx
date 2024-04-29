import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '~/components/Button';
import { NftSelectorHeader } from '~/components/NftSelector/NftSelectorHeader';
import { NftSelectorToolbar } from '~/components/NftSelector/NftSelectorToolbar';
import { NftSelectorWrapper } from '~/components/NftSelector/NftSelectorWrapper';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { NftSelectorPickerGridTokenGridFragment$data } from '~/generated/NftSelectorPickerGridTokenGridFragment.graphql';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';
import { NftSelectorLoadingSkeleton } from '~/screens/NftSelectorScreen/NftSelectorLoadingSkeleton';
import { NftSelectorPickerGrid } from '~/screens/NftSelectorScreen/NftSelectorPickerGrid';

export type SelectedItemMultiMode = {
  id: string;
  contractAddress?: string;
};

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

  const [isMultiselectMode, setIsMultiselectMode] = useState(false);

  const [selectedTokens, setSelectedTokens] = useState<SelectedItemMultiMode[]>([]);

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      if (isMultiselectMode) {
        setSelectedTokens((prevTokens) => {
          if (
            prevTokens.some((token) => {
              return token.id === tokenId;
            })
          ) {
            return [
              ...prevTokens.filter((token) => {
                return token.id !== tokenId;
              }),
            ];
          } else {
            return [
              ...prevTokens,
              {
                id: tokenId,
              },
            ];
          }
        });
      } else {
        navigation.navigate({
          name: 'GalleryEditor',
          params: {
            galleryId: route.params.galleryId,
            stagedTokens: [tokenId],
          },
          merge: true,
        });
      }
    },
    [isMultiselectMode, navigation, route.params.galleryId]
  );

  const handleSelectNftGroup = useCallback(
    (contractAddress: string, tokens: NftSelectorPickerGridTokenGridFragment$data[number][]) => {
      if (isMultiselectMode) {
        const formattedTokens = tokens.map((token) => {
          return {
            id: token.dbid,
            contractAddress,
          };
        });

        setSelectedTokens((prevTokens) => {
          if (
            prevTokens.some((token) => {
              return token.contractAddress === contractAddress;
            })
          ) {
            return [
              ...prevTokens.filter((token) => {
                return token.contractAddress !== contractAddress;
              }),
            ];
          } else {
            return [...prevTokens, ...formattedTokens];
          }
        });
      } else {
        navigation.navigate({
          name: 'NftSelectorContractGalleryEditor',
          params: {
            contractAddress,
          },
        });
      }
    },
    [isMultiselectMode, navigation]
  );

  const handleAddSelectedTokens = useCallback(() => {
    const formattedTokens = selectedTokens.map((token) => token.id);

    navigation.navigate({
      name: 'GalleryEditor',
      params: {
        galleryId: route.params.galleryId,
        stagedTokens: formattedTokens,
      },
      merge: true,
    });
  }, [navigation, route.params.galleryId, selectedTokens]);

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
        <NftSelectorHeader
          title="Select item to add"
          rightButton={
            <Button
              onPress={handleAddSelectedTokens}
              eventElementId={null}
              eventName={null}
              eventContext={null}
              text="add"
              size="xs"
            />
          }
        />
        <Text>{JSON.stringify(selectedTokens)}</Text>
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
          isMultiselectMode={isMultiselectMode}
          setIsMultiselectMode={setIsMultiselectMode}
          handleSync={sync}
        />
      </View>
      <View className="flex-grow flex-1 w-full">
        <Suspense fallback={<NftSelectorLoadingSkeleton />}>
          <NftSelectorPickerGrid
            searchCriteria={searchCriteria}
            onRefresh={sync}
            onSelect={handleSelectNft}
            onSelectNftGroup={handleSelectNftGroup}
            isMultiselectMode={isMultiselectMode}
            selectedTokens={selectedTokens}
          />
        </Suspense>
      </View>
    </NftSelectorWrapper>
  );
}
