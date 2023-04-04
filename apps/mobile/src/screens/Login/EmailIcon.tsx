import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function EmailIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path d="M21.5 5h-19v14h19V5Z" stroke="#FEFEFE" strokeMiterlimit={10} />
      <Path d="m2.5 5 9.5 7 9.5-7" stroke="#FEFEFE" strokeMiterlimit={10} />
    </Svg>
  );
}
