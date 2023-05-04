import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function SendIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path
        stroke="#F9F9F9"
        strokeMiterlimit={10}
        d="M14.667 1.333 7.333 8.667M14.667 1.333 10 14.667l-2.667-6-6-2.667 13.334-4.667Z"
      />
    </Svg>
  );
}
