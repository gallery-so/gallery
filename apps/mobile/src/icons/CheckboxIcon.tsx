import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function CheckboxIcon(props: SvgProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
      <Path d="M5 8.5l3 3 5-5" stroke="#0022F0" strokeMiterlimit={10} />
      <Path stroke="#0022F0" d="M0.5 0.5H17.5V17.5H0.5z" />
    </Svg>
  );
}
