import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRightIcon } from 'src/icons/ChevronRightIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { LoginStackNavigatorProp } from '~/navigation/types';

import { useCacheIntroVideo } from './useCacheIntroVideo';

export const SEEN_ONBOARDING_VIDEO_STORAGE_KEY = 'hasSeenOnboardingVideo';

export function OnboardingVideoScreen() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { uri } = useCacheIntroVideo();

  const handleRedirectToLandingScreen = useCallback(() => {
    AsyncStorage.setItem(SEEN_ONBOARDING_VIDEO_STORAGE_KEY, 'true');
    navigation.navigate('Landing');
  }, [navigation]);

  return (
    <View className="bg-white relative">
      <View
        className="flex-row items-center space-x-[5] justify-end absolute z-10 right-4"
        style={{
          top: top,
        }}
      >
        <GalleryTouchableOpacity
          onPress={handleRedirectToLandingScreen}
          eventElementId="Press Skip Onboarding Video"
          eventName="Press Skip Onboarding Video"
        >
          <Typography
            className="text-sm text-metal"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Skip
          </Typography>
        </GalleryTouchableOpacity>

        <ChevronRightIcon />
      </View>
      {uri && (
        <Video
          style={{
            width: '100%',
            height: '100%',
          }}
          shouldPlay
          resizeMode={ResizeMode.COVER}
          source={{
            uri,
          }}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              handleRedirectToLandingScreen();
            }
          }}
        />
      )}
    </View>
  );
}
