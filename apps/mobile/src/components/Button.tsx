import clsx from 'clsx';
import { ReactNode } from 'react';
import { NativeSyntheticEvent, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

import { Typography } from './Typography';

type Variant = 'dark' | 'light';

type ButtonProps = {
  style?: TouchableOpacityProps['style'];
  text: string;
  icon?: ReactNode;
  variant?: Variant;
  onPress?: TouchableOpacityProps['onPress'];
};

type VariantMapType = { [variant in Variant]: string };

export function Button({ icon, text, onPress, variant = 'dark', style }: ButtonProps) {
  const containerVariants: VariantMapType = {
    dark: 'bg-offBlack',
    light: 'bg-white border border-faint',
  };

  const textVariants: VariantMapType = {
    dark: 'text-white',
    light: 'text-offBlack',
  };

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      {/* Setting a height explicitly here to ensure icons / text gets the same treatment */}
      <View
        className={clsx(
          'flex h-[44] flex-row items-center justify-center space-x-4 px-4',
          containerVariants[variant]
        )}
      >
        {icon}

        <Typography
          font={{ family: 'ABCDiatype', weight: 'Medium' }}
          className={clsx('text-xs uppercase', textVariants[variant])}
        >
          {text}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}
