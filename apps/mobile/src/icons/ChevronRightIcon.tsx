import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function ChevronRightIcon(props: SvgProps) {
  return (
    <Svg width={7} height={12} fill="none" {...props}>
      <Path stroke="#9E9E9E" strokeMiterlimit={10} d="M1.333 1.333 6 6l-4.667 4.667" />
    </Svg>
  );
}
