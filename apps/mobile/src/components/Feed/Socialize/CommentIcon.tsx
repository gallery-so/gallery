import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function CommentIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={22} height={22} fill="none" {...props} viewBox="0 0 20 20">
      <Path
        stroke={colorScheme === 'dark' ? colors.white : colors.offBlack}
        d="M1 14V1h18v13h-9l-5 4v-4H1Z"
      />
    </Svg>
  );
}
