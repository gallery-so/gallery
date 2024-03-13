import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
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
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
import { NftSelectorPickerGridRefetchQuery } from '~/generated/NftSelectorPickerGridRefetchQuery.graphql';
import { NftSelectorPickerScreenExperienceQuery } from '~/generated/NftSelectorPickerScreenExperienceQuery.graphql';
import { NftSelectorPickerScreenQuery } from '~/generated/NftSelectorPickerScreenQuery.graphql';
import { NftSelectorPickerScreenQueryFragment$key } from '~/generated/NftSelectorPickerScreenQueryFragment.graphql';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';
import {
  LoginStackNavigatorProp,
  MainTabStackNavigatorParamList,
  ScreenWithNftSelector,
} from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import useExperience from '~/shared/hooks/useExperience';
import { chains } from '~/shared/utils/chains';

import CreatorSupportAnnouncementBottomSheetModal from './CreatorSupportAnnouncementBottomSheetModal';
import {
  NetworkChoice,
  NftSelectorFilterBottomSheet,
  NftSelectorSortView,
} from './NftSelectorFilterBottomSheet';
import { NftSelectorLoadingSkeleton } from './NftSelectorLoadingSkeleton';
import { NftSelectorPickerGrid } from './NftSelectorPickerGrid';

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
  ProfilePicture: 'Select profile picture',
  Post: 'Select item to post',
  Onboarding: 'Select profile picture',
  Community: 'Select item to post',
};

type InnerNftSelectorPickerScreenProps = {
  ownershipTypeFilter: 'Collected' | 'Created';
  onOwnershipTypeFilterChange: (filter: 'Collected' | 'Created') => void;
};

function InnerNftSelectorPickerScreen({
  ownershipTypeFilter,
  onOwnershipTypeFilterChange,
}: InnerNftSelectorPickerScreenProps) {
  const query = useLazyLoadQuery<NftSelectorPickerScreenQuery>(
    graphql`
      query NftSelectorPickerScreenQuery {
        ...NftSelectorPickerScreenQueryFragment
      }
    `,
    {}
  );

  const [data, refetch] = useRefetchableFragment<
    NftSelectorPickerGridRefetchQuery,
    NftSelectorPickerScreenQueryFragment$key
  >(
    graphql`
      fragment NftSelectorPickerScreenQueryFragment on Query
      @refetchable(queryName: "NftSelectorPickerGridRefetchQuery") {
        viewer {
          ... on Viewer {
            user {
              tokens {
                creationTime
                ...NftSelectorPickerGridTokensFragment
              }
              primaryWallet {
                __typename
              }
            }
          }
        }
        ...NftSelectorPickerGridFragment
      }
    `,
    query
  );

  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftSelector'>>();

  const currentScreen = route.params.page;
  const isFullscreen = route.params.fullScreen;

  const { top } = useSafeAreaPadding();
  const filterBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleSettingsPress = useCallback(() => {
    filterBottomSheetRef.current?.present();
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [networkFilter, setNetworkFilter] = useState<NetworkChoice>('Ethereum');
  const [sortView, setSortView] = useState<NftSelectorSortView>('Recently added');

  const { isSyncing, syncTokens, isSyncingCreatedTokens, syncCreatedTokens } =
    useSyncTokensActions();

  const screenTitle = useMemo(() => {
    return screenHeaderText[currentScreen];
  }, [currentScreen]);

  const handleRefresh = useCallback(() => {
    refetch({ networkFilter }, { fetchPolicy: 'network-only' });
  }, [networkFilter, refetch]);

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
                  onOwnerFilterChange={onOwnershipTypeFilterChange}
                  sortView={sortView}
                  onSortViewChange={setSortView}
                  selectedNetwork={networkFilter}
                />
              </View>
            </View>
            <View className="flex-grow flex-1 w-full">
              <NftSelectorPickerGrid
                searchCriteria={{
                  searchQuery,
                  ownerFilter: ownershipTypeFilter,
                  networkFilter: networkFilter,
                  sortView,
                }}
                screen={currentScreen}
                onRefresh={handleRefresh}
                queryRef={data}
              />
            </View>
          </View>
        </View>
        <Suspense fallback={<></>}>
          <CreatorBottomSheetWrapper isViewingCreatedFilter={ownershipTypeFilter === 'Created'} />
        </Suspense>
      </View>
    </>
  );
}

function CreatorBottomSheetWrapper({
  isViewingCreatedFilter,
}: {
  isViewingCreatedFilter: boolean;
}) {
  const experienceQuery = useLazyLoadQuery<NftSelectorPickerScreenExperienceQuery>(
    graphql`
      query NftSelectorPickerScreenExperienceQuery {
        ...useExperienceFragment
      }
    `,
    {}
  );

  const [creatorBetaAnnouncementSeen, setCreatorBetaAnnouncementSeen] = useExperience({
    type: 'CreatorBetaMicroAnnouncementModal',
    queryRef: experienceQuery,
  });
  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  useEffect(() => {
    if (isViewingCreatedFilter && !creatorBetaAnnouncementSeen) {
      showBottomSheetModal({
        content: <CreatorSupportAnnouncementBottomSheetModal onClose={hideBottomSheetModal} />,
      });
      setCreatorBetaAnnouncementSeen({ experienced: true });
    }
  }, [
    creatorBetaAnnouncementSeen,
    hideBottomSheetModal,
    isViewingCreatedFilter,
    setCreatorBetaAnnouncementSeen,
    showBottomSheetModal,
  ]);

  useEffect(() => {}, [hideBottomSheetModal, showBottomSheetModal]);

  return <></>;
}

export function NftSelectorPickerScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftSelector'>>();

  const [ownershipTypeFilter, setFilter] = useState<'Collected' | 'Created'>('Collected');

  const currentScreen = route.params.page;
  const isFullscreen = route.params.fullScreen;

  const screenTitle = useMemo(() => {
    return screenHeaderText[currentScreen];
  }, [currentScreen]);

  const decoratedNetworks = useMemo(() => {
    return NETWORKS.map((network) => {
      return {
        ...network,
        disabled: ownershipTypeFilter === 'Created' && !network.hasCreatorSupport,
      };
    });
  }, [ownershipTypeFilter]);

  return (
    <Suspense
      fallback={
        <NftSelectorLoadingScreenWithHeader
          currentScreen={currentScreen}
          isFullscreen={isFullscreen}
          screenTitle={screenTitle}
          networkFilter="Ethereum"
          networkOptions={decoratedNetworks}
        />
      }
    >
      <InnerNftSelectorPickerScreen
        ownershipTypeFilter={ownershipTypeFilter}
        onOwnershipTypeFilterChange={setFilter}
      />
    </Suspense>
  );
}

type NftSelectorLoadingScreenWithHeaderProps = {
  currentScreen: ScreenWithNftSelector;
  isFullscreen?: boolean;
  screenTitle: string;
  networkFilter: NetworkChoice;
  networkOptions: { label: string; id: NetworkChoice; icon: JSX.Element; disabled?: boolean }[];
};

function NftSelectorLoadingScreenWithHeader({
  currentScreen,
  isFullscreen,
  networkFilter,
  networkOptions,
  screenTitle,
}: NftSelectorLoadingScreenWithHeaderProps) {
  const { top } = useSafeAreaPadding();

  return (
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
              inputMode="search"
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
              onChange={() => {}}
              selectedId={networkFilter}
              options={networkOptions}
            />

            <View className="flex flex-row space-x-1">
              <AnimatedRefreshIcon
                onSync={() => {}}
                onRefresh={() => {}}
                isSyncing
                eventElementId="NftSelectorSelectorRefreshButton"
                eventName="NftSelectorSelectorRefreshButton pressed"
              />

              <IconContainer
                size="sm"
                onPress={() => {}}
                icon={<SlidersIcon />}
                eventElementId="NftSelectorSelectorSettingsButton"
                eventName="NftSelectorSelectorSettingsButton pressed"
                eventContext={contexts.Posts}
              />
            </View>
          </View>
          <View className="flex-grow flex-1 w-full">
            <NftSelectorLoadingSkeleton />
          </View>
        </View>
      </View>
    </View>
  );
}
