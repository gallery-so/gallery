import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  height?: number;
  width?: number;
} & SvgProps;

export function QRCodeIcon({ height = 16, width = 16, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={width} height={height} fill="none" {...props}>
      <Path
        stroke={colorScheme === 'dark' ? colors.white : colors.black[800]}
        strokeMiterlimit={10}
        d="M22 6V2h-4M2 18v4h4M18 22h4v-4M6 2H2v4M10.5 5.5h-5v5h5v-5ZM18.5 5.5h-5v5h5v-5ZM13.5 19v-6M18.5 16v2.5H16M16 13.5h3M10.5 13.5h-5v5h5v-5ZM7.5 8h1M15.5 8h1M7.5 16h1M16.5 16h-3"
      />
    </Svg>
  );
}
