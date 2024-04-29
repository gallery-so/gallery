import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function CheckboxIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();
  const stroke = colorScheme === 'dark' ? colors.darkModeBlue : colors.activeBlue;
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
      <Path d="M5 8.5l3 3 5-5" stroke={stroke} strokeMiterlimit={10} />
      <Path stroke={stroke} d="M0.5 0.5H17.5V17.5H0.5z" />
    </Svg>
  );
}
