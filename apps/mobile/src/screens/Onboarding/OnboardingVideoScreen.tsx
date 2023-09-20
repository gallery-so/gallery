import { useNavigation } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRightIcon } from 'src/icons/ChevronRightIcon';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { LoginStackNavigatorProp } from '~/navigation/types';

export function OnboardingVideoScreen() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const handleSkip = useCallback(() => {
    navigation.navigate('Landing');
  }, []);

  return (
    <View className="bg-white relative">
      <View
        className="flex-row items-center space-x-[5] justify-end absolute z-10 right-4"
        style={{
          top: top,
        }}
      >
        <GalleryTouchableOpacity
          onPress={handleSkip}
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
      <Video
        style={{
          width: '100%',
          height: '100%',
        }}
        shouldPlay
        resizeMode={ResizeMode.COVER}
        source={{
          // TODO: Replace with actual video URL
          uri: 'https://yuvsgodipjvycbdvgahw.supabase.co/storage/v1/object/public/dev/onboarding?t=2023-09-20T01%3A56%3A43.640Z',
        }}
      />
    </View>
  );
}
