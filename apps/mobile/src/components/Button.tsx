import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { ReactNode, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import colors from '~/shared/theme/colors';

import { GalleryTouchableOpacity, GalleryTouchableOpacityProps } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

type Variant = 'primary' | 'secondary' | 'danger' | 'disabled' | 'blue';
type FontWeight = 'Medium' | 'Regular' | 'Bold';
type Size = 'xs' | 'sm' | 'md';

export type ButtonProps = {
  style?: GalleryTouchableOpacityProps['style'];
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  text?: string;
  headerElement?: ReactNode;
  footerElement?: ReactNode;
  variant?: Variant;
  textClassName?: string;
  containerClassName?: string;
  fontWeight?: FontWeight;
  size?: Size;
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
        containerClassName: 'bg-white border border-porcelain',
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
    disabled: {
      inactive: {
        containerClassName: 'bg-porcelain border border-porcelain',
        textClassName: 'text-metal',
        loadingColor: 'black',
      },
      active: {
        containerClassName: 'bg-porcelain border border-porcelain',
        textClassName: 'text-metal',
        loadingColor: 'black',
      },
    },
    blue: {
      inactive: {
        containerClassName: 'bg-white',
        textClassName: 'text-black-800',
        loadingColor: 'black',
      },
      active: {
        containerClassName: 'bg-white border border-[#2563ebcc]',
        textClassName: 'text-black-800',
        loadingColor: 'black',
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
    disabled: {
      inactive: {
        containerClassName: 'bg-black-500 border border-black-500',
        textClassName: 'text-shadow',
        loadingColor: colors.shadow,
      },
      active: {
        containerClassName: 'bg-black-500 border border-black-500',
        textClassName: 'text-shadow',
        loadingColor: colors.shadow,
      },
    },
    blue: {
      inactive: {
        containerClassName: 'bg-black-900',
        textClassName: 'text-white',
        loadingColor: 'white',
      },
      active: {
        containerClassName: 'bg-black-900 border border-[#2563ebcc]',
        textClassName: 'text-white',
        loadingColor: 'white',
      },
    },
  },
};

export function Button({
  headerElement,
  text,
  variant = 'primary',
  loading,
  disabled,
  style,
  textClassName,
  containerClassName,
  size = 'md',
  fontWeight = 'Medium',
  footerElement,
  DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme,
  ...props
}: ButtonProps) {
  const { colorScheme: hookColorScheme } = useColorScheme();
  const colorScheme = DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme ?? hookColorScheme;

  const [active, setActive] = useState(false);

  const variantClassNames =
    buttonVariants[colorScheme][disabled ? 'disabled' : variant][active ? 'active' : 'inactive'];

  const sizeVariants: { [size in Size]: string } = {
    xs: 'h-[24] px-4',
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
          'relative flex h-[36] items-center justify-center px-6',
          variantClassNames.containerClassName,
          !active ? containerClassName : null,
          sizeVariants[size]
        )}
      >
        <View
          className={clsx('flex flex-row items-center justify-center space-x-2', {
            'opacity-0': loading,
            'opacity-100': !loading,
          })}
        >
          {headerElement}

          <View className="flex-row items-center space-x-1">
            <Typography
              font={{ family: 'ABCDiatype', weight: fontWeight }}
              className={clsx(
                'text-xs uppercase text-center',
                variantClassNames.textClassName,
                textClassName
              )}
            >
              {text}
            </Typography>

            {footerElement}
          </View>
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
