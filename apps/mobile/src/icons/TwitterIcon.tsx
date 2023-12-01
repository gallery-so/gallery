import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  height?: number;
  width?: number;
  fill?: string;
};

export function TwitterIcon({ height = 16, width = 16, fill }: Props) {
  const { colorScheme } = useColorScheme();
  const strokeColor = fill ? fill : colorScheme === 'dark' ? colors.white : colors.black['800'];

  return (
    <Svg width={width} height={height} viewBox="0 0 21 18" fill="none">
      <Path
        d="M20.959 2.037a8.763 8.763 0 01-2.471.678A4.337 4.337 0 0020.38.33a8.907 8.907 0 01-2.736 1.036A4.3 4.3 0 0010.2 4.305c0 .33.038.66.111.983A12.194 12.194 0 011.435.803a4.226 4.226 0 00-.582 2.166 4.307 4.307 0 001.914 3.584 4.292 4.292 0 01-1.949-.54v.054A4.306 4.306 0 004.27 10.29a4.34 4.34 0 01-1.935.075 4.318 4.318 0 004.028 2.989 8.629 8.629 0 01-5.339 1.841c-.342 0-.684-.02-1.024-.059a12.253 12.253 0 006.613 1.933A12.16 12.16 0 0018.861 4.837c0-.183 0-.367-.013-.551A8.69 8.69 0 0021 2.053l-.041-.016z"
        fill={strokeColor}
      />
    </Svg>
  );
}
