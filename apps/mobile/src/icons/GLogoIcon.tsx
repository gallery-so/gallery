import * as React from 'react';
import { useColorScheme } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function GLogoIcon(props: SvgProps) {
  const colorScheme = useColorScheme();

  return (
    <Svg width={25} height={33} viewBox="0 0 25 33" fill="none" {...props}>
      <Path
        d="M22.2 20.672c0-2.976.452-3.743 2.21-3.878v-1.622H11.787v1.622c4.282.181 6.539-.327 6.539 3.385l.013 5.924a7.662 7.662 0 01-.956 2.11c-.926 1.353-2.46 1.983-4.531 1.983-4.909 0-7.813-5.183-7.813-14.108S7.715 1.853 13.077 1.853c4.147 0 6.643 2.739 7.278 8.507h1.848V.574h-1.758c-.225 1.127-.407 1.442-.813 1.442-.719 0-2.721-2.016-6.731-2.016C5.376 0 .416 6.748.416 16.257c0 9.599 4.74 15.818 12.526 15.818h.015c4.592 0 6.058-3.064 6.369-4.04l1.102 3.635h1.758l.014-10.998z"
        fill={colorScheme === 'dark' ? colors.white : colors.offBlack}
      />
    </Svg>
  );
}
