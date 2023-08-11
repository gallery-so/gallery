import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { RefreshIcon } from 'src/icons/RefreshIcon';
import { SlidersIcon } from 'src/icons/SlidersIcon';

import { BackButton } from '~/components/BackButton';
import { FadedInput } from '~/components/FadedInput';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { IconContainer } from '~/components/IconContainer';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Select } from '~/components/Select';
import { Typography } from '~/components/Typography';
import { NftSelectorPickerScreenQuery } from '~/generated/NftSelectorPickerScreenQuery.graphql';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

import {
  NetworkChoice,
  NftSelectorFilterBottomSheet,
  NftSelectorSortView,
} from './NftSelectorFilterBottomSheet';
import { NftSelectorPickerGrid } from './NftSelectorPickerGrid';
import { NftSelectorScreenFallback } from './NftSelectorScreenFallback';

export function NftSelectorPickerScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'ProfilePicturePicker'>>();

  const query = useLazyLoadQuery<NftSelectorPickerScreenQuery>(
    graphql`
      query NftSelectorPickerScreenQuery {
        ...NftSelectorPickerGridFragment
      }
    `,
    {}
  );

  const currentScreen = route.params.page;

  const { top } = useSafeAreaPadding();
  const filterBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleSettingsPress = useCallback(() => {
    filterBottomSheetRef.current?.present();
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<'Collected' | 'Created'>('Collected');
  const [networkFilter, setNetworkFilter] = useState<NetworkChoice>('all');
  const [sortView, setSortView] = useState<NftSelectorSortView>('Recently added');

  const screenTitle = useMemo(() => {
    return currentScreen === 'ProfilePicture' ? 'Select a profile picture' : 'Select item to post';
  }, [currentScreen]);

  return (
    <View className="flex-1 bg-white dark:bg-black-900" style={{ paddingTop: top }}>
      <View className="flex flex-col flex-grow space-y-8">
        <View className="px-4 relative">
          <BackButton />

          <View
            className="absolute inset-0 flex flex-row justify-center items-center"
            pointerEvents="none"
          >
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {screenTitle}
            </Typography>
          </View>
        </View>

        <View className="flex flex-col flex-grow space-y-4">
          <View className="px-4">
            <FadedInput
              // TODO: Follow up w/ Fraser on input divergence here
              inputMode="search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ height: 36 }}
              icon={<SearchIcon width={16} height={16} />}
              placeholder="Search pieces"
            />
          </View>

          <View className="px-4 flex flex-row items-center justify-between">
            <Select
              className="w-32"
              title="Owner Filter"
              eventElementId="NftSelectorOwnerFilter"
              onChange={setFilter}
              selectedId={filter}
              options={[
                { id: 'Collected', label: 'Collected' },
                { id: 'Created', label: 'Created' },
              ]}
            />

            <View className="flex flex-row space-x-1">
              <IconContainer
                size="sm"
                onPress={() => {}}
                icon={<RefreshIcon />}
                eventElementId="NftSelectorSelectorRefreshButton"
                eventName="NftSelectoreSelectorRefreshButton pressed"
              />
              <IconContainer
                size="sm"
                onPress={handleSettingsPress}
                icon={<SlidersIcon />}
                eventElementId="NftSelectorSelectorSettingsButton"
                eventName="NftSelectorSelectorSettingsButton pressed"
              />

              <NftSelectorFilterBottomSheet
                ref={filterBottomSheetRef}
                network={networkFilter}
                onNetworkChange={setNetworkFilter}
                sortView={sortView}
                onSortViewChange={setSortView}
              />
            </View>
          </View>

          <View className="flex-grow flex-1 w-full">
            <Suspense fallback={<NftSelectorScreenFallback />}>
              <NftSelectorPickerGrid
                searchCriteria={{
                  searchQuery,
                  ownerFilter: filter,
                  networkFilter: networkFilter,
                  sortView,
                }}
                queryRef={query}
                screen={currentScreen}
              />
            </Suspense>
          </View>
        </View>
      </View>
    </View>
  );
}
