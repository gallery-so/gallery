import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  height?: number;
  width?: number;
} & SvgProps;

export function QRCodeIcon({ height = 16, width = 16, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <G
        clipPath="url(#clip0_998_36495)"
        stroke={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
        strokeMiterlimit={10}
      >
        <Path d="M14.667 4V1.333H12M1.333 12v2.667H4M12 14.667h2.667V12M4 1.333H1.333V4M7 3.667H3.667V7H7V3.667zM12.333 3.667H9V7h3.333V3.667zM9 12.667v-4M12.333 10.667v1.666h-1.666M10.667 9h2M7 9H3.667v3.333H7V9zM5 5.333h.667M10.333 5.333H11M5 10.667h.667M11 10.667H9" />
      </G>
      <Defs>
        <ClipPath id="clip0_998_36495">
          <Path
            fill={colorScheme === 'dark' ? colors.black.DEFAULT : colors.white}
            d="M0 0H16V16H0z"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
