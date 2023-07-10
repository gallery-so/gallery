import clsx from 'clsx';
import { ReactElement } from 'react';
import { View } from 'react-native';

import { GalleryTouchableOpacity, GalleryTouchableOpacityProps } from './GalleryTouchableOpacity';

type IconContainerProps = {
  className?: string;
  icon: ReactElement;
  onPress: () => void;
  size?: 'xs' | 'sm' | 'md';
  border?: boolean;
} & GalleryTouchableOpacityProps;

export function IconContainer({
  icon,
  onPress,
  style,
  size,
  border,
  ...props
}: IconContainerProps) {
  const sizeVariants: { [size in 'xs' | 'sm' | 'md']: string } = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
  };

  return (
    <GalleryTouchableOpacity style={style} onPress={onPress} {...props}>
      <View
        className={clsx(
          'bg-faint dark:bg-black-500 items-center justify-center rounded-full',
          sizeVariants[size ?? 'md'],
          border && 'border-[0.5px] border-black-800'
        )}
      >
        {icon}
      </View>
    </GalleryTouchableOpacity>
  );
}
