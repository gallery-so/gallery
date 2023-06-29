import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function SlidersIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M2.667 14v-3M2.667 8.333V2M8 14V9.666M8 7V2M13.333 14v-1.666M13.333 9.667V2M.667 11h4M6 7h4M11.333 12.334h4"
        stroke={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
      />
    </Svg>
  );
}
