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
  color?: 'default' | 'white' | 'black' | 'active';
} & GalleryTouchableOpacityProps;

export function IconContainer({
  icon,
  onPress,
  style,
  size,
  border,
  color,
  ...props
}: IconContainerProps) {
  const sizeVariants: { [size in 'xs' | 'sm' | 'md']: string } = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
  };

  const colorVariants: { [color in 'default' | 'white' | 'black' | 'active']: string } = {
    default: 'bg-faint dark:bg-black-500',
    white: 'bg-white dark:bg-black-900',
    black: 'bg-black-900 dark:bg-white',
    active: 'bg-porcelain dark:bg-white',
  };

  return (
    <GalleryTouchableOpacity style={style} onPress={onPress} {...props}>
      <View
        className={clsx(
          'items-center justify-center rounded-full',
          sizeVariants[size ?? 'md'],
          colorVariants[color ?? 'default'],
          border && 'border-[0.5px] border-black-800 dark:border-offWhite'
        )}
      >
        {icon}
      </View>
    </GalleryTouchableOpacity>
  );
}
