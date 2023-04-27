import clsx from 'clsx';
import { ReactNode } from 'react';
import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

import { Typography } from './Typography';

type Variant = 'primary' | 'secondary';

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
  variant = 'primary',
  loading,
  disabled,
  style,
}: ButtonProps) {
  const containerVariants: VariantMapType = {
    primary: 'bg-offBlack dark:bg-white',
    secondary: 'bg-white dark:bg-black border border-faint dark:border-graphite',
  };

  const textVariants: VariantMapType = {
    primary: 'text-white dark:text-offBlack',
    secondary: 'text-offBlack dark:text-white',
  };

  const loadingIndicatorColor: VariantMapType = {
    primary: 'white',
    secondary: 'black',
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
