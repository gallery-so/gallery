import * as React from 'react';
import { useColorScheme } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function CommentIcon(props: SvgProps) {
  const colorScheme = useColorScheme();

  return (
    <Svg width={20} height={20} fill="none" {...props}>
      <Path
        stroke={colorScheme === 'dark' ? colors.white : colors.offBlack}
        d="M1 14V1h18v13h-9l-5 4v-4H1Z"
      />
    </Svg>
  );
}
