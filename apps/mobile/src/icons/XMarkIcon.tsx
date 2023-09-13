import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  height?: number;
  color?: string;
} & SvgProps;

export const XMarkIcon = ({ height = 12, color, ...props }: Props) => {
  const { colorScheme } = useColorScheme();
  const originalHeight = 12;
  const scale = height / originalHeight;

  return (
    <Svg width={12 * scale} height={height} fill="none" {...props}>
      <Path
        d="m10.667 1.333-9.334 9.333M1.333 1.333l9.334 9.333"
        stroke={color ?? (colorScheme === 'dark' ? colors.white : colors.black['800'])}
        strokeMiterlimit={10}
        transform={`scale(${scale})`}
      />
    </Svg>
  );
};
