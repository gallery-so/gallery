import * as React from 'react';
import Svg, { Path,SvgProps } from 'react-native-svg';

export const XMarkIcon = (props: SvgProps) => (
  <Svg width={12} height={12} fill="none" {...props}>
    <Path
      d="m10.667 1.333-9.334 9.333M1.333 1.333l9.334 9.333"
      stroke="#141414"
      strokeMiterlimit={10}
    />
  </Svg>
);
