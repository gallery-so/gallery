import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { contexts } from 'shared/analytics/constants';
import { ChevronRightIcon } from 'src/icons/ChevronRightIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NftSelector } from '~/components/NftSelector/NftSelector';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { Typography } from '~/components/Typography';
import { LoginStackNavigatorProp } from '~/navigation/types';

import { useProfilePicture } from '../NftSelectorScreen/useProfilePicture';

export function OnboardingNftSelectorScreen() {
  const { ownershipTypeFilter } = useNftSelector();

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
        ownerFilter: ownershipTypeFilter,
        fullScreen: true,
      });
    },
    [navigation, ownershipTypeFilter]
  );

  const handleSkipProfilePictureOnboarding = useCallback(() => {
    navigation.navigate('Login', {
      screen: 'OnboardingProfileBio',
    });
  }, [navigation]);

  return (
    <NftSelector
      isFullscreen
      title="Select profile picture"
      onSelectNft={handleSelectNft}
      onSelectNftGroup={handleSelectNftGroup}
      headerActions={
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
      headerChildren={
        <View className="pt-4">
          <OnboardingProgressBar from={40} to={60} />
        </View>
      }
    />
  );
}
