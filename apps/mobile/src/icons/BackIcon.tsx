import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function BackIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path
        d="M10 3.333 5.333 8 10 12.667"
        stroke={colorScheme === 'dark' ? colors.white : colors.offBlack}
        strokeMiterlimit={10}
      />
    </Svg>
  );
}
