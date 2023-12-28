import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function RightArrowIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  const strokeColor = props.color
    ? props.color
    : colorScheme === 'dark'
    ? colors.white
    : colors.black['800'];

  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none" {...props}>
      <Path d="M1 10.667L5.667 6 1 1.333" stroke={strokeColor} strokeMiterlimit={10} />
    </Svg>
  );
}
