import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '~/components/BackButton';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { PostInput } from '~/components/Post/PostInput';
import { Typography } from '~/components/Typography';

export function PostScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-black-900" style={{ paddingTop: top }}>
      <View className="flex flex-col flex-grow space-y-8">
        <View className="px-4 relative flex-row items-center justify-between">
          <BackButton />

          <View className="flex flex-row justify-center items-center" pointerEvents="none">
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              New post
            </Typography>
          </View>

          <GalleryTouchableOpacity onPress={() => {}} eventElementId={null} eventName={null}>
            <Typography
              className="text-sm text-activeBlue"
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
            >
              POST
            </Typography>
          </GalleryTouchableOpacity>
        </View>

        <View className="px-4 flex flex-col flex-grow space-y-4">
          <PostInput />
        </View>
      </View>
    </View>
  );
}
