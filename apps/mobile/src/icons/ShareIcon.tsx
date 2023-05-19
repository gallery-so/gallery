import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function ShareIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();
  const stroke = colorScheme === 'dark' ? colors.white : colors.offBlack;
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke={stroke} strokeMiterlimit={3.999} d="M2.5 6.5h11v7h-11z" />
      <Path d="M11 5 8 2 5 5M8 2v8" stroke={stroke} strokeMiterlimit={10} />
    </Svg>
  );
}
