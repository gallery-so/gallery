import clsx from 'clsx';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  NativeSyntheticEvent,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

import { Typography } from './Typography';

type Variant = 'dark' | 'light';

type ButtonProps = {
  style?: TouchableOpacityProps['style'];
  loading?: boolean;
  disabled?: boolean;
  text: string;
  icon?: ReactNode;
  variant?: Variant;
  onPress?: TouchableOpacityProps['onPress'];
};

type VariantMapType = { [variant in Variant]: string };

export function Button({
  icon,
  text,
  onPress,
  variant = 'dark',
  loading,
  disabled,
  style,
}: ButtonProps) {
  const containerVariants: VariantMapType = {
    dark: 'bg-offBlack',
    light: 'bg-white border border-faint',
  };

  const textVariants: VariantMapType = {
    dark: 'text-white',
    light: 'text-offBlack',
  };

  const loadingIndicatorColor: VariantMapType = {
    dark: 'white',
    light: 'black',
  };

  return (
    <TouchableOpacity disabled={loading || disabled} onPress={onPress} style={style}>
      {/* Setting a height explicitly here to ensure icons / text gets the same treatment */}
      <View
        className={clsx(
          'relative flex h-[44] items-center justify-center  px-4',
          containerVariants[variant]
        )}
      >
        {!loading && (
          <View className="flex flex-row items-center justify-center space-x-4">
            {icon}

            <Typography
              font={{ family: 'ABCDiatype', weight: 'Medium' }}
              className={clsx('text-xs uppercase', textVariants[variant])}
            >
              {text}
            </Typography>
          </View>
        )}

        {loading && (
          <View>
            <ActivityIndicator color={loadingIndicatorColor[variant]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
