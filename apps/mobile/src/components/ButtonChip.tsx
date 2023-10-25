import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { PropsWithChildren, useState } from 'react';
import { TouchableOpacityProps, ViewProps } from 'react-native';

import {
  GalleryTouchableOpacity,
  GalleryTouchableOpacityProps,
} from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';

type ButtonChipVariant = 'primary' | 'secondary';

type ButtonChipProps = PropsWithChildren<{
  style?: ViewProps['style'];
  eventProperties?: GalleryTouchableOpacityProps['properties'];
  variant: ButtonChipVariant;
  onPress: TouchableOpacityProps['onPress'];
  width?: 'fixed' | 'grow';
}>;

type ChipContainerVariants = {
  [variant in ButtonChipVariant]: {
    [colorSchem in 'light' | 'dark']: {
      [activeState in 'active' | 'inactive']: {
        containerClassName: string;
        textClassName: string;
      };
    };
  };
};

// This is a typesafe object to represent the variants of the FollowButton.
// You can find an up to date source of truth at the following link.
// https://www.figma.com/file/9SV2MUDU1DVieJclgr3Z43/Dark-Mode-%5BDesktop-%2B-Mobile%5D?type=design&node-id=430-8037&t=ZwDhf5OcEhuhgQKy-0
const chipContainerVariants: ChipContainerVariants = {
  primary: {
    light: {
      inactive: {
        containerClassName: 'bg-black-800',
        textClassName: 'text-white',
      },
      active: {
        containerClassName: 'bg-black-600',
        textClassName: 'text-white',
      },
    },
    dark: {
      inactive: {
        containerClassName: 'bg-white',
        textClassName: 'text-black-800',
      },
      active: {
        containerClassName: 'bg-metal',
        textClassName: 'text-black-800',
      },
    },
  },
  secondary: {
    light: {
      inactive: {
        containerClassName: 'bg-porcelain',
        textClassName: 'text-black-800',
      },
      active: {
        containerClassName: 'bg-metal',
        textClassName: 'text-black-800',
      },
    },
    dark: {
      inactive: {
        containerClassName: 'bg-[#303030]',
        textClassName: 'text-white',
      },
      active: {
        containerClassName: 'bg-black-600',
        textClassName: 'text-white',
      },
    },
  },
};

export function ButtonChip({
  style,
  eventProperties,
  children,
  variant,
  onPress,
  width,
}: ButtonChipProps) {
  const { colorScheme } = useColorScheme();
  const [active, setActive] = useState(false);

  const chipContainerClassNames =
    chipContainerVariants[variant][colorScheme][active ? 'active' : 'inactive'];

  return (
    <GalleryTouchableOpacity
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
      // TODO: analytics this should be prop drilled
      eventElementId="Follow Button"
      eventName="Follow Button Clicked"
      eventContext={null}
      activeOpacity={1}
      properties={{ variant, ...eventProperties }}
      onPress={onPress}
      className={clsx(
        'flex h-6 items-center justify-center rounded-sm px-2 bg-black',
        chipContainerClassNames.containerClassName,
        {
          'w-24': width === 'fixed',
          'w-auto': width === 'grow',
        }
      )}
      style={style}
    >
      <Typography
        className={clsx('text-sm', chipContainerClassNames.textClassName)}
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
      >
        {children}
      </Typography>
    </GalleryTouchableOpacity>
  );
}
