import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function SettingsIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  const strokeColor = colorScheme === 'dark' ? colors.white : colors.black['800'];

  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <G stroke={strokeColor} clipPath="url(#a)">
        <Path d="m10.133 12.734-.666 1.933H6.533l-.666-1.933L5 12.201l-2 .4-1.533-2.534 1.4-1.533V7.467l-1.4-1.533L3 3.401l2 .4.867-.534.666-1.933h2.934l.666 1.933.867.534 2-.4 1.533 2.533-1.4 1.533v1.067l1.4 1.533L13 12.601l-2-.4-.867.533Z" />
        <Path strokeMiterlimit={10} d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h16v16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
