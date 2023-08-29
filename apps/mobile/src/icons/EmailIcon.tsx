import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function EmailIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? colors.offWhite : colors.black.DEFAULT;
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path d="M21.5 5h-19v14h19V5Z" stroke={color} strokeMiterlimit={10} />
      <Path d="m2.5 5 9.5 7 9.5-7" stroke={color} strokeMiterlimit={10} />
    </Svg>
  );
}
