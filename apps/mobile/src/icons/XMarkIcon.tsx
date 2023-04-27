import * as React from 'react';
import { useColorScheme } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export const XMarkIcon = (props: SvgProps) => {
  const colorScheme = useColorScheme();
  return (
    <Svg width={12} height={12} fill="none" {...props}>
      <Path
        d="m10.667 1.333-9.334 9.333M1.333 1.333l9.334 9.333"
        stroke={colorScheme === 'dark' ? colors.white : colors.offBlack}
        strokeMiterlimit={10}
      />
    </Svg>
  );
};
