import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { ChevronRightIcon } from 'src/icons/ChevronRightIcon';
import { SlidersIcon } from 'src/icons/SlidersIcon';
import { getChainIconComponent } from 'src/utils/getChainIconComponent';

import { AnimatedRefreshIcon } from '~/components/AnimatedRefreshIcon';
import { BackButton } from '~/components/BackButton';
import { FadedInput } from '~/components/FadedInput';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { IconContainer } from '~/components/IconContainer';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Select } from '~/components/Select';
import { Typography } from '~/components/Typography';
import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
import { NftSelectorPickerScreenQuery } from '~/generated/NftSelectorPickerScreenQuery.graphql';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';
import { LoginStackNavigatorProp, MainTabStackNavigatorParamList } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import useExperience from '~/shared/hooks/useExperience';
import { chains } from '~/shared/utils/chains';

import { CreatorSupportAnnouncementBottomSheet } from './CreatorSupportAnnouncementBottomSheet';
import {
  NetworkChoice,
  NftSelectorFilterBottomSheet,
  NftSelectorSortView,
} from './NftSelectorFilterBottomSheet';
import { NftSelectorPickerGrid } from './NftSelectorPickerGrid';
import { NftSelectorPickerScreenFallback } from './NftSelectorPickerScreenFallback';
import { NftSelectorScreenFallback } from './NftSelectorScreenFallback';

const NETWORKS: {
  label: string;
  id: NetworkChoice;
  icon: JSX.Element;
  hasCreatorSupport: boolean;
}[] = [
  ...chains.map((chain) => ({
    label: chain.name,
    id: chain.name,
    icon: getChainIconComponent(chain),
    hasCreatorSupport: chain.hasCreatorSupport,
  })),
];

const screenHeaderText = {
  ProfilePicture: 'Select a profile picture',
  Post: 'Select item to post',
  Onboarding: 'Select profile picture',
  Community: 'Select item to post',
};

function InnerNftSelectorPickerScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'ProfilePicturePicker'>>();

  const query = useLazyLoadQuery<NftSelectorPickerScreenQuery>(
    graphql`
      query NftSelectorPickerScreenQuery {
        ...useExperienceFragment
        ...NftSelectorPickerGridFragment
      }
    `,
    {}
  );

  const currentScreen = route.params.page;
  const isFullscreen = route.params.fullScreen;

  const { top } = useSafeAreaPadding();
  const filterBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const announcementBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleSettingsPress = useCallback(() => {
    filterBottomSheetRef.current?.present();
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ownershipTypeFilter, setFilter] = useState<'Collected' | 'Created'>('Collected');
  const [networkFilter, setNetworkFilter] = useState<NetworkChoice>('Ethereum');
  const [sortView, setSortView] = useState<NftSelectorSortView>('Recently added');

  const { isSyncing, syncTokens, isSyncingCreatedTokens, syncCreatedTokens } =
    useSyncTokensActions();

  const screenTitle = useMemo(() => {
    return screenHeaderText[currentScreen];
  }, [currentScreen]);

  const handleRefresh = useCallback(() => {
    syncTokens(networkFilter);
  }, [networkFilter, syncTokens]);

  const handleSync = useCallback(async () => {
    if (ownershipTypeFilter === 'Collected') {
      await syncTokens(networkFilter);
    }
    if (ownershipTypeFilter === 'Created') {
      await syncCreatedTokens(networkFilter);
    }
  }, [ownershipTypeFilter, syncTokens, networkFilter, syncCreatedTokens]);

  const handleNetworkChange = useCallback((network: NetworkChoice) => {
    setNetworkFilter(network);
  }, []);

  const [creatorBetaAnnouncementSeen, setCreatorBetaAnnouncementSeen] = useExperience({
    type: 'CreatorBetaMicroAnnouncementModal',
    queryRef: query,
  });

  useEffect(() => {
    if (ownershipTypeFilter === 'Created' && !creatorBetaAnnouncementSeen) {
      announcementBottomSheetRef.current?.present();
      setCreatorBetaAnnouncementSeen({ experienced: true });
    }
  }, [creatorBetaAnnouncementSeen, ownershipTypeFilter, setCreatorBetaAnnouncementSeen]);

  const decoratedNetworks = useMemo(() => {
    return NETWORKS.map((network) => {
      return {
        ...network,
        disabled: ownershipTypeFilter === 'Created' && !network.hasCreatorSupport,
      };
    });
  }, [ownershipTypeFilter]);

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const handleSkipProfilePictureOnboarding = useCallback(() => {
    navigation.navigate('OnboardingProfileBio');
  }, [navigation]);

  return (
    <>
      <View
        className="flex-1 bg-white dark:bg-black-900"
        style={{
          paddingTop: isFullscreen ? top : 16,
        }}
      >
        <View className="flex flex-col flex-grow space-y-8">
          <View>
            <View className="px-4 relative flex-row justify-between items-center">
              <BackButton />

              <View
                className="absolute inset-0 flex flex-row justify-center items-center"
                pointerEvents="none"
              >
                <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                  {screenTitle}
                </Typography>
              </View>

              {currentScreen === 'Onboarding' && (
                <GalleryTouchableOpacity
                  eventElementId="Skip profile picture onboarding button"
                  eventName="Skip profile picture onboarding button pressed"
                  eventContext={contexts.Onboarding}
                  className="flex-row items-center gap-[5]"
                  onPress={handleSkipProfilePictureOnboarding}
                >
                  <Typography
                    className="text-sm text-metal"
                    font={{ family: 'ABCDiatype', weight: 'Regular' }}
                  >
                    Skip
                  </Typography>
                  <ChevronRightIcon />
                </GalleryTouchableOpacity>
              )}
            </View>

            {currentScreen === 'Onboarding' && (
              <View className="pt-4">
                <OnboardingProgressBar from={40} to={60} />
              </View>
            )}
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
                options={decoratedNetworks}
              />

              <View className="flex flex-row space-x-1">
                <AnimatedRefreshIcon
                  onSync={handleSync}
                  onRefresh={handleRefresh}
                  isSyncing={
                    ownershipTypeFilter === 'Collected' ? isSyncing : isSyncingCreatedTokens
                  }
                  eventElementId="NftSelectorSelectorRefreshButton"
                  eventName="NftSelectorSelectorRefreshButton pressed"
                />

                <IconContainer
                  size="sm"
                  onPress={handleSettingsPress}
                  icon={<SlidersIcon />}
                  eventElementId="NftSelectorSelectorSettingsButton"
                  eventName="NftSelectorSelectorSettingsButton pressed"
                  eventContext={contexts.Posts}
                />

                <NftSelectorFilterBottomSheet
                  ref={filterBottomSheetRef}
                  ownerFilter={ownershipTypeFilter}
                  onOwnerFilterChange={setFilter}
                  sortView={sortView}
                  onSortViewChange={setSortView}
                  selectedNetwork={networkFilter}
                />
              </View>
            </View>
            <View className="flex-grow flex-1 w-full">
              <Suspense fallback={<NftSelectorScreenFallback />}>
                <NftSelectorPickerGrid
                  searchCriteria={{
                    searchQuery,
                    ownerFilter: ownershipTypeFilter,
                    networkFilter: networkFilter,
                    sortView,
                  }}
                  queryRef={query}
                  screen={currentScreen}
                  onRefresh={handleRefresh}
                />
              </Suspense>
            </View>
          </View>
        </View>
      </View>
      <CreatorSupportAnnouncementBottomSheet ref={announcementBottomSheetRef} />
    </>
  );
}

export function NftSelectorPickerScreen() {
  return (
    <Suspense fallback={<NftSelectorPickerScreenFallback />}>
      <InnerNftSelectorPickerScreen />
    </Suspense>
  );
}
