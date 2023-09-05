import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  height?: number;
  width?: number;
} & SvgProps;

export function EthIcon({ height = 12, width = 12, ...props }: Props) {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24" {...props}>
      <Path
        fill="#000"
        d="M11.997 9.137 5.25 12.204l6.747 3.989 6.75-3.989-6.75-3.067Z"
        opacity={0.6}
      />
      <Path fill="#000" d="m5.252 12.204 6.747 3.989V1.008L5.252 12.204Z" opacity={0.45} />
      <Path fill="#000" d="M12 1.008v15.185l6.747-3.99L12 1.009Z" opacity={0.8} />
      <Path fill="#000" d="m5.25 13.484 6.747 9.509v-5.522L5.25 13.484Z" opacity={0.45} />
      <Path fill="#000" d="M11.998 17.47v5.523l6.752-9.509-6.752 3.987Z" opacity={0.8} />
    </Svg>
  );
}
