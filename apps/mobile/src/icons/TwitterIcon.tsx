import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function TwitterIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none" {...props}>
      <Path
        d="M13.973 1.667c-.524.23-1.08.383-1.648.452a2.891 2.891 0 001.262-1.59 5.938 5.938 0 01-1.824.691 2.867 2.867 0 00-4.889 2.614A8.13 8.13 0 01.957.844a2.817 2.817 0 00-.388 1.444 2.871 2.871 0 001.276 2.39 2.861 2.861 0 01-1.3-.36v.035A2.87 2.87 0 002.847 7.17c-.421.113-.862.13-1.29.05A2.879 2.879 0 004.242 9.21 5.752 5.752 0 010 10.4a8.17 8.17 0 004.409 1.288 8.105 8.105 0 008.165-8.155c0-.122 0-.244-.009-.367A5.794 5.794 0 0014 1.677l-.027-.01z"
        fill={colorScheme === 'dark' ? colors.white : colors.black}
      />
    </Svg>
  );
}
