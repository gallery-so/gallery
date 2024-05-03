import { useColorScheme } from 'nativewind';
import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function MaximizeIcon({ ...props }: SvgProps) {
  const { colorScheme } = useColorScheme();
  const strokeColor = colorScheme === 'dark' ? colors.white : colors.black['800'];

  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M13.9997 6.66667V2H9.33301"
        stroke={strokeColor}
        stroke-width="0.666667"
        stroke-miterlimit="10"
      />
      <Path
        d="M13.9997 2L9.33301 6.66667"
        stroke={strokeColor}
        stroke-width="0.666667"
        stroke-miterlimit="10"
      />
      <Path
        d="M2 9.33398V14.0007H6.66667"
        stroke={strokeColor}
        stroke-width="0.666667"
        stroke-miterlimit="10"
      />
      <Path
        d="M2 13.9993L6.33333 9.66602"
        stroke={strokeColor}
        stroke-width="0.666667"
        stroke-miterlimit="10"
      />
    </Svg>
  );
}
