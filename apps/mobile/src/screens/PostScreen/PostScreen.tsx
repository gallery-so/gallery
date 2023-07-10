import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '~/components/Typography';

export function PostScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: top }} className="relative flex-1 bg-white dark:bg-black-900">
      <View className="p-4">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-2xl"
        >
          Post
        </Typography>
      </View>
    </View>
  );
}
