import clsx from 'clsx';
import { View } from 'react-native';

import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

type BottomSheetRowProps = {
  icon?: React.ReactNode;
  text: string;
  onPress: () => void;
  style?: React.ComponentProps<typeof GalleryTouchableOpacity>['style'];
  isConfirmationRow?: boolean;
  fontWeight?: 'Regular' | 'Bold';
  rightIcon?: React.ReactNode;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export function BottomSheetRow({
  icon,
  text,
  onPress,
  style,
  isConfirmationRow,
  fontWeight = 'Regular',
  rightIcon,
  eventContext,
}: BottomSheetRowProps) {
  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      eventElementId="Bottom Sheet Row"
      eventName="Bottom Sheet Row Press"
      eventContext={eventContext}
      properties={{ selection: text }}
      style={style}
    >
      <View className="bg-offWhite dark:bg-black-800 p-3 flex-row items-center">
        {icon && <View className="mr-2">{icon}</View>}
        <Typography
          font={{ family: 'ABCDiatype', weight: fontWeight }}
          className={clsx(
            'text-sm',
            isConfirmationRow ? 'text-red' : 'text-black-900 dark:text-offWhite'
          )}
        >
          {text}
        </Typography>
        {rightIcon && <View className="ml-auto">{rightIcon}</View>}
      </View>
    </GalleryTouchableOpacity>
  );
}
