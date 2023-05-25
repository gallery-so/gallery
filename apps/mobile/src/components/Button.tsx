import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { GalleryTouchableOpacity, GalleryTouchableOpacityProps } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

type Variant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  style?: GalleryTouchableOpacityProps['style'];
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  text: string;
  icon?: ReactNode;
  variant?: Variant;
  size?: 'sm' | 'md';
} & GalleryTouchableOpacityProps;

type VariantMapType = { [variant in Variant]: string };
type ExplicitSchemeVariantMapType = {
  [variant in Variant]: {
    [scheme in 'light' | 'dark']: string;
  };
};

export function Button({
  icon,
  text,
  variant = 'primary',
  loading,
  disabled,
  style,
  size = 'md',
  ...props
}: ButtonProps) {
  const containerVariants: VariantMapType = {
    primary: 'bg-offBlack dark:bg-white',
    secondary: 'bg-white dark:bg-black border border-faint dark:border-graphite',
    danger: 'bg-white dark:bg-black border border-red',
  };

  const textVariants: VariantMapType = {
    primary: 'text-white dark:text-offBlack',
    secondary: 'text-offBlack dark:text-white',
    danger: 'text-red',
  };

  const loadingIndicatorColor: ExplicitSchemeVariantMapType = {
    primary: {
      light: 'white',
      dark: 'black',
    },
    secondary: {
      light: 'black',
      dark: 'white',
    },
    danger: {
      light: 'red',
      dark: 'red',
    },
  };

  const sizeVariants: { [size in 'sm' | 'md']: string } = {
    sm: 'h-[36] px-6',
    md: 'h-[44] px-4',
  };

  const { colorScheme } = useColorScheme();

  return (
    <GalleryTouchableOpacity disabled={loading || disabled} style={style} {...props}>
      {/* Setting a height explicitly here to ensure icons / text gets the same treatment */}
      <View
        className={clsx(
          'relative flex h-[36] items-center justify-center  px-6',
          containerVariants[variant],
          sizeVariants[size]
        )}
      >
        <View
          className={clsx('flex flex-row items-center justify-center space-x-4', {
            'opacity-0': loading,
            'opacity-100': !loading,
          })}
        >
          {icon}

          <Typography
            font={{ family: 'ABCDiatype', weight: 'Medium' }}
            className={clsx('text-xs uppercase', textVariants[variant])}
          >
            {text}
          </Typography>
        </View>

        {loading && (
          <View className="absolute inset-0 flex justify-center items-center">
            <ActivityIndicator color={loadingIndicatorColor[variant][colorScheme]} />
          </View>
        )}
      </View>
    </GalleryTouchableOpacity>
  );
}
