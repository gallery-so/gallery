import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function CloseIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path
        d="m12.666 3.333-9.333 9.334M3.333 3.333l9.333 9.334"
        stroke="#000"
        strokeMiterlimit={10}
      />
    </Svg>
  );
}
