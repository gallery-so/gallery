import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

type Props = {
  username: string;
  comment: string;
  onClose: () => void;
};

export function CommentsRepliedBanner({ username, comment, onClose }: Props) {
  const { colorScheme } = useColorScheme();

  if (!username || !comment) {
    return null;
  }

  return (
    <View className="py-2 px-4 bg-faint dark:bg-black-800">
      <View className="flex-row items-center justify-between">
        <Typography
          className="text-sm text-shadow dark:text-metal"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          Replying to {username}
        </Typography>
        <GalleryTouchableOpacity
          eventElementId="Close Replied Comment Banner"
          eventName="Close Replied Comment Banner Pressed"
          eventContext={contexts.Reply}
          onPress={onClose}
        >
          <XMarkIcon color={colorScheme === 'dark' ? colors.offWhite : colors.black[800]} />
        </GalleryTouchableOpacity>
      </View>
      <Typography
        className="text-sm text-shadow dark:text-metal pr-2"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
        numberOfLines={1}
      >
        {comment}
      </Typography>
    </View>
  );
}
