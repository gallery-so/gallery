import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function BackIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path d="M10 3.333 5.333 8 10 12.667" stroke="#000" strokeMiterlimit={10} />
    </Svg>
  );
}
