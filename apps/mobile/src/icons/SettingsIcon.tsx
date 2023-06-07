import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function SettingsIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  const strokeColor = colorScheme === 'dark' ? colors.white : colors.black['800'];

  return (
    <Svg width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
      <Path
        d="M15.7 19.1l-1 2.9h-4.4l-1-2.9-1.3-.8-3 .6-2.3-3.8 2.1-2.3v-1.6L2.7 8.9 5 5.1l3 .6 1.3-.8 1-2.9h4.4l1 2.9 1.3.8 3-.6 2.3 3.8-2.1 2.3v1.6l2.1 2.3-2.3 3.8-3-.6-1.3.8z"
        stroke={strokeColor}
      />
      <Path d="M12.5 15a3 3 0 100-6 3 3 0 000 6z" stroke={strokeColor} strokeMiterlimit={10} />
    </Svg>
  );
}
