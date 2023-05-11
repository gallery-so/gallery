import * as React from 'react';
import { useColorScheme } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function ErrorIcon(props: SvgProps) {
  const colorScheme = useColorScheme();

  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={colorScheme === 'dark' ? colors.white : colors.black}
      className="w-6 h-6"
      {...props}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </Svg>
  );
}
