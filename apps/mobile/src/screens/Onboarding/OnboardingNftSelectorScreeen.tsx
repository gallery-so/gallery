import { useNavigation } from '@react-navigation/native';
import { Suspense,useCallback } from 'react';
import { View } from 'react-native';
import { contexts } from 'shared/analytics/constants';
import { ChevronRightIcon } from 'src/icons/ChevronRightIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NftSelectorHeader } from '~/components/NftSelector/NftSelectorHeader';
import { NftSelectorToolbar } from '~/components/NftSelector/NftSelectorToolbar';
import { NftSelectorWrapper } from '~/components/NftSelector/NftSelectorWrapper';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { Typography } from '~/components/Typography';
import { LoginStackNavigatorProp } from '~/navigation/types';

import { NftSelectorLoadingSkeleton } from '../NftSelectorScreen/NftSelectorLoadingSkeleton';
import { NftSelectorPickerGrid } from '../NftSelectorScreen/NftSelectorPickerGrid';
import { useProfilePicture } from '../NftSelectorScreen/useProfilePicture';

export function OnboardingNftSelectorScreen() {
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

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { setProfileImage } = useProfilePicture();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      setProfileImage(tokenId).then(() => {
        navigation.navigate('Login', {
          screen: 'OnboardingProfileBio',
        });
        return;
      });
    },
    [navigation, setProfileImage]
  );

  const handleSelectNftGroup = useCallback(
    (contractAddress: string) => {
      navigation.navigate('OnboardingNftSelectorContract', {
        contractAddress: contractAddress,
        page: 'Post',
        ownerFilter: 'Collected',
        fullScreen: true,
      });
    },
    [navigation]
  );

  const handleSkipProfilePictureOnboarding = useCallback(() => {
    navigation.navigate('Login', {
      screen: 'OnboardingProfileBio',
    });
  }, [navigation]);

  return (
    <NftSelectorWrapper ownershipTypeFilter={ownershipTypeFilter} isFullscreen>
      <View className="gap-8">
        <NftSelectorHeader
          title="Select profile picture"
          rightButton={
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
          }
        >
          <View className="pt-4">
            <OnboardingProgressBar from={40} to={60} />
          </View>
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
            onSelect={handleSelectNft}
            onSelectNftGroup={handleSelectNftGroup}
          />
        </Suspense>
      </View>
    </NftSelectorWrapper>
  );
}
