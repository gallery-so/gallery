import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function CircleCheckIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();
  const stroke = props.stroke
    ? props.stroke
    : colorScheme === 'dark'
    ? colors.white
    : colors.black['800'];
  return (
    <Svg width="48" height="48" viewBox="0 0 48 48" fill="none" {...props}>
      <Path
        d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
        stroke={stroke}
        strokeWidth={2}
      />
      <Path d="M16 24L22 30L32 20" stroke={stroke} strokeWidth="2" stroke-miterlimit="10" />
    </Svg>
  );
}
