import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function DropdownIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M4.667 10L8 13.333 11.333 10M11.334 6L8 2.667 4.667 6"
        stroke="#000"
        strokeMiterlimit={10}
      />
    </Svg>
  );
}
