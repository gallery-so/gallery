import { ReactElement } from 'react';
import { View } from 'react-native';

import { GalleryTouchableOpacity, GalleryTouchableOpacityProps } from './GalleryTouchableOpacity';

type IconContainerProps = {
  className?: string;
  icon: ReactElement;
  onPress: () => void;
  size?: 'sm' | 'md';
} & GalleryTouchableOpacityProps;

export function IconContainer({ icon, onPress, style, size, ...props }: IconContainerProps) {
  return (
    <GalleryTouchableOpacity style={style} onPress={onPress} {...props}>
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
