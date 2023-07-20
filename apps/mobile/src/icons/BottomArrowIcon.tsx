import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function BottomArrowIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  const strokeColor = colorScheme === 'dark' ? colors.white : colors.black['800'];

  return (
    <Svg width={17} height={16} fill="none" {...props}>
      <Path stroke={strokeColor} strokeMiterlimit={10} d="M3.833 6 8.5 10.667 13.167 6" />
    </Svg>
  );
}
