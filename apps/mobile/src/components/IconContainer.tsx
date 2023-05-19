import { ReactElement } from 'react';
import { TouchableOpacityProps, View } from 'react-native';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';

type IconContainerProps = {
  className?: string;
  style?: TouchableOpacityProps['style'];
  icon: ReactElement;
  onPress: () => void;
  size?: 'sm' | 'md';
};

export function IconContainer({ icon, onPress, style, size }: IconContainerProps) {
  return (
    <GalleryTouchableOpacity eventElementId={null} eventName={null} style={style} onPress={onPress}>
      <View
        className={`bg-faint dark:bg-graphite items-center justify-center rounded-full ${
          size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
        } `}
      >
        {icon}
      </View>
    </GalleryTouchableOpacity>
  );
}
