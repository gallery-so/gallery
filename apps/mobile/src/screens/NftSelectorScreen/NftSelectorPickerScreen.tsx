import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { RefreshIcon } from 'src/icons/RefreshIcon';
import { SlidersIcon } from 'src/icons/SlidersIcon';
import { getChainIconComponent } from 'src/utils/getChainIconComponent';

import { BackButton } from '~/components/BackButton';
import { FadedInput } from '~/components/FadedInput';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { IconContainer } from '~/components/IconContainer';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Select } from '~/components/Select';
import { Typography } from '~/components/Typography';
import { useSyncTokenstActions } from '~/contexts/SyncTokensContext';
import { useToastActions } from '~/contexts/ToastContext';
import { NftSelectorPickerScreenFragment$key } from '~/generated/NftSelectorPickerScreenFragment.graphql';
import { NftSelectorPickerScreenQuery } from '~/generated/NftSelectorPickerScreenQuery.graphql';
import { NftSelectorPickerScreenRefetchQuery } from '~/generated/NftSelectorPickerScreenRefetchQuery.graphql';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';
import { MainTabStackNavigatorParamList } from '~/navigation/types';
import { chains } from '~/shared/utils/chains';

import {
  NetworkChoice,
  NftSelectorFilterBottomSheet,
  NftSelectorSortView,
} from './NftSelectorFilterBottomSheet';
import { NftSelectorPickerGrid } from './NftSelectorPickerGrid';
import { NftSelectorScreenFallback } from './NftSelectorScreenFallback';

const NETWORKS: { label: string; id: NetworkChoice; icon: JSX.Element }[] = [
  ...chains.map((chain) => ({
    label: chain.name,
    id: chain.name,
    icon: getChainIconComponent(chain),
  })),
];

export function NftSelectorPickerScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'ProfilePicturePicker'>>();

  const query = useLazyLoadQuery<NftSelectorPickerScreenQuery>(
    graphql`
      query NftSelectorPickerScreenQuery {
        ...NftSelectorPickerScreenFragment
      }
    `,
    {}
  );

  const [data, refetch] = useRefetchableFragment<
    NftSelectorPickerScreenRefetchQuery,
    NftSelectorPickerScreenFragment$key
  >(
    graphql`
      fragment NftSelectorPickerScreenFragment on Query
      @refetchable(queryName: "NftSelectorPickerScreenRefetchQuery") {
        ...NftSelectorPickerGridFragment
      }
    `,
    query
  );

  const currentScreen = route.params.page;
  const isFullscreen = route.params.fullScreen;

  const { top } = useSafeAreaPadding();
  const filterBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleSettingsPress = useCallback(() => {
    filterBottomSheetRef.current?.present();
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<'Collected' | 'Created'>('Collected');
  const [networkFilter, setNetworkFilter] = useState<NetworkChoice>('Ethereum');
  const [sortView, setSortView] = useState<NftSelectorSortView>('Recently added');

  const screenTitle = useMemo(() => {
    return currentScreen === 'ProfilePicture' ? 'Select a profile picture' : 'Select item to post';
  }, [currentScreen]);

  const handleRefresh = useCallback(() => {
    refetch({ networkFilter }, { fetchPolicy: 'network-only' });
  }, [networkFilter, refetch]);

  const handleNetworkChange = useCallback((network: NetworkChoice) => {
    setNetworkFilter(network);
  }, []);

  return (
    <View
      className="flex-1 bg-white dark:bg-black-900"
      style={{
        paddingTop: isFullscreen ? top : 16,
      }}
    >
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
              title="Network"
              eventElementId="NftSelectorNetworkFilter"
              onChange={handleNetworkChange}
              selectedId={networkFilter}
              options={NETWORKS}
            />

            <View className="flex flex-row space-x-1">
              <AnimatedRefreshIcon networkFilter={networkFilter} onRefresh={handleRefresh} />
              <IconContainer
                size="sm"
                onPress={handleSettingsPress}
                icon={<SlidersIcon />}
                eventElementId="NftSelectorSelectorSettingsButton"
                eventName="NftSelectorSelectorSettingsButton pressed"
              />

              <NftSelectorFilterBottomSheet
                ref={filterBottomSheetRef}
                ownerFilter={filter}
                onOwnerFilterChange={setFilter}
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
                queryRef={data}
                screen={currentScreen}
              />
            </Suspense>
          </View>
        </View>
      </View>
    </View>
  );
}

type AnimatedRefreshIconProps = {
  networkFilter: NetworkChoice;
  onRefresh: () => void;
};

function AnimatedRefreshIcon({ networkFilter, onRefresh }: AnimatedRefreshIconProps) {
  const { isSyncing, syncTokens } = useSyncTokenstActions();

  const { pushToast } = useToastActions();

  const handleSync = useCallback(async () => {
    if (isSyncing) return;

    await syncTokens(networkFilter);
    onRefresh();
    pushToast({
      message: 'Successfully refreshed your collection',
      withoutNavbar: true,
    });
  }, [isSyncing, networkFilter, onRefresh, pushToast, syncTokens]);

  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = useCallback(() => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      // Only repeat the animation if it completed (wasn't interrupted) and isSyncing is still true
      if (finished && isSyncing) {
        spin();
      }
    });
  }, [isSyncing, spinValue]);

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (isSyncing) {
      spin();
    } else {
      spinValue.stopAnimation();
    }
  }, [isSyncing, spin, spinValue]);

  return (
    <IconContainer
      size="sm"
      onPress={handleSync}
      icon={
        <Animated.View style={{ transform: [{ rotate: spinAnimation }] }}>
          <RefreshIcon />
        </Animated.View>
      }
      eventElementId="NftSelectorSelectorRefreshButton"
      eventName="NftSelectoreSelectorRefreshButton pressed"
    />
  );
}
