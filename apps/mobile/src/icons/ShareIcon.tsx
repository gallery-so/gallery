import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function ShareIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke="#141414" strokeMiterlimit={3.999} d="M2.5 6.5h11v7h-11z" />
      <Path d="M11 5 8 2 5 5M8 2v8" stroke="#000" strokeMiterlimit={10} />
    </Svg>
  );
}
