import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { G, Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function GlobeIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();
  const stroke = colorScheme === 'dark' ? colors.white : colors.black['800'];

  return (
    <Svg width={17} height={17} viewBox="0 0 16 16" fill="none" {...props}>
      <G clip-path="url(#clip0_7851_2375)">
        <Path
          d="M8.00004 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00004 1.33325C4.31814 1.33325 1.33337 4.31802 1.33337 7.99992C1.33337 11.6818 4.31814 14.6666 8.00004 14.6666Z"
          stroke={stroke}
        />
        <Path
          d="M8.00004 14.6666C9.4728 14.6666 10.6667 11.6818 10.6667 7.99992C10.6667 4.31802 9.4728 1.33325 8.00004 1.33325C6.52728 1.33325 5.33337 4.31802 5.33337 7.99992C5.33337 11.6818 6.52728 14.6666 8.00004 14.6666Z"
          stroke={stroke}
        />
        <Path d="M1.33337 8H14.6667" stroke={stroke} />
        <Path
          d="M13.3333 12.0001C11.6468 11.2914 9.82861 10.9505 7.99996 11.0001C6.17131 10.9505 4.3531 11.2914 2.66663 12.0001"
          stroke={stroke}
        />
        <Path
          d="M2.66663 4C4.3531 4.70868 6.17131 5.04959 7.99996 5C9.82861 5.04959 11.6468 4.70868 13.3333 4"
          stroke={stroke}
        />
      </G>
    </Svg>
  );
}
