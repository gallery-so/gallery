import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function CommentIcon(props: SvgProps) {
  return (
    <Svg width={20} height={20} fill="none" {...props}>
      <Path stroke="#141414" d="M1 14V1h18v13h-9l-5 4v-4H1Z" />
    </Svg>
  );
}
