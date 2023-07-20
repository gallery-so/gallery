import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { ReactNode, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import colors from '~/shared/theme/colors';

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
  DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme?: 'light' | 'dark';
} & GalleryTouchableOpacityProps;

type ButtonVariants = {
  [colorScheme in 'light' | 'dark']: {
    [variant in Variant]: {
      [activeState in 'active' | 'inactive']: {
        containerClassName: string;
        textClassName: string;
        loadingColor: string;
      };
    };
  };
};

const buttonVariants: ButtonVariants = {
  light: {
    primary: {
      inactive: {
        containerClassName: 'bg-black-800',
        textClassName: 'text-white',
        loadingColor: 'white',
      },
      active: {
        containerClassName: 'bg-[#303030]',
        textClassName: 'text-white',
        loadingColor: 'white',
      },
    },
    secondary: {
      inactive: {
        containerClassName: 'bg-white border border-faint',
        textClassName: 'text-black-800',
        loadingColor: 'black',
      },
      active: {
        containerClassName: 'bg-white border border-black-800',
        textClassName: 'text-black-800',
        loadingColor: 'black',
      },
    },
    danger: {
      inactive: {
        containerClassName: 'bg-white border border-red',
        textClassName: 'text-red',
        loadingColor: colors.red,
      },
      active: {
        containerClassName: 'bg-faint border border-red',
        textClassName: 'text-red',
        loadingColor: colors.red,
      },
    },
  },
  dark: {
    primary: {
      inactive: {
        containerClassName: 'bg-white',
        textClassName: 'text-black-800',
        loadingColor: 'black',
      },
      active: {
        containerClassName: 'bg-porcelain',
        textClassName: 'text-black-800',
        loadingColor: 'black',
      },
    },
    secondary: {
      inactive: {
        containerClassName: 'bg-black-900 border border-[#303030]',
        textClassName: 'text-white',
        loadingColor: 'white',
      },
      active: {
        containerClassName: 'bg-black-900 border border-white',
        textClassName: 'text-white',
        loadingColor: 'white',
      },
    },
    danger: {
      inactive: {
        containerClassName: 'bg-black-900 border border-red',
        textClassName: 'text-red',
        loadingColor: colors.red,
      },
      active: {
        containerClassName: 'bg-black-700 border border-red',
        textClassName: 'text-red',
        loadingColor: colors.red,
      },
    },
  },
};

export function Button({
  icon,
  text,
  variant = 'primary',
  loading,
  disabled,
  style,
  size = 'md',
  DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme,
  ...props
}: ButtonProps) {
  const { colorScheme: hookColorScheme } = useColorScheme();
  const colorScheme = DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme ?? hookColorScheme;

  const [active, setActive] = useState(false);

  const variantClassNames = buttonVariants[colorScheme][variant][active ? 'active' : 'inactive'];

  const sizeVariants: { [size in 'sm' | 'md']: string } = {
    sm: 'h-[36] px-4',
    md: 'h-[44] px-6',
  };

  return (
    <GalleryTouchableOpacity
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
      disabled={loading || disabled}
      activeOpacity={1}
      style={style}
      {...props}
    >
      {/* Setting a height explicitly here to ensure icons / text gets the same treatment */}
      <View
        className={clsx(
          'relative flex h-[36] items-center justify-center  px-6',
          variantClassNames.containerClassName,
          sizeVariants[size]
        )}
      >
        <View
          className={clsx('flex flex-row items-center justify-center space-x-2', {
            'opacity-0': loading,
            'opacity-100': !loading,
          })}
        >
          {icon}

          <Typography
            font={{ family: 'ABCDiatype', weight: 'Medium' }}
            className={clsx('text-xs uppercase', variantClassNames.textClassName)}
          >
            {text}
          </Typography>
        </View>

        {loading && (
          <View className="absolute inset-0 flex justify-center items-center">
            <ActivityIndicator color={variantClassNames.loadingColor} />
          </View>
        )}
      </View>
    </GalleryTouchableOpacity>
  );
}
