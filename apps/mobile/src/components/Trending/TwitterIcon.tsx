import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export const TwitterIcon = (props: SvgProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={22} height={18} fill="none" {...props}>
      <Path
        fill={colorScheme === 'dark' ? colors.white : colors.offBlack}
        d="M21.459 2.5a8.763 8.763 0 0 1-2.471.678A4.337 4.337 0 0 0 20.88.794a8.907 8.907 0 0 1-2.736 1.036A4.3 4.3 0 0 0 10.7 4.768c0 .331.038.66.111.983a12.194 12.194 0 0 1-8.876-4.485 4.226 4.226 0 0 0-.582 2.166 4.307 4.307 0 0 0 1.914 3.584 4.292 4.292 0 0 1-1.949-.539v.053a4.306 4.306 0 0 0 3.452 4.223 4.342 4.342 0 0 1-1.935.075 4.318 4.318 0 0 0 4.028 2.99 8.629 8.629 0 0 1-5.339 1.841c-.342 0-.684-.02-1.024-.059a12.253 12.253 0 0 0 6.613 1.932A12.16 12.16 0 0 0 19.361 5.3c0-.183 0-.367-.013-.55A8.69 8.69 0 0 0 21.5 2.515l-.041-.016Z"
      />
    </Svg>
  );
};
