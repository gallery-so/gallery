import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  height?: number;
  width?: number;
} & SvgProps;

export function EthIcon({ height = 12, width = 12, ...props }: Props) {
  const { colorScheme } = useColorScheme();
  const fillColor = colorScheme === 'light' ? colors.black.DEFAULT : colors.offWhite;

  return (
    <Svg width={width} height={height} viewBox="0 0 12 12" fill="none" {...props}>
      <G clipPath="url(#clip0_2134_7334)" fill={fillColor}>
        <Path opacity={0.6} d="M5.999 4.567L2.625 6.101l3.374 1.995L9.373 6.1 6 4.567z" />
        <Path opacity={0.45} d="M2.626 6.101L6 8.096V.503L2.626 6.101z" />
        <Path opacity={0.8} d="M6 .503v7.593L9.374 6.1 6 .503z" />
        <Path opacity={0.45} d="M2.625 6.741l3.374 4.755V8.734L2.625 6.741z" />
        <Path opacity={0.8} d="M5.999 8.734v2.762L9.375 6.74 5.999 8.734z" />
      </G>
      <Defs>
        <ClipPath id="clip0_2134_7334">
          <Path fill={fillColor} d="M0 0H12V12H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
