import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function RefreshIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path d="M11.333 6.667h4v-4M4.667 9.334h-4v4" stroke="#141414" />
      <Path
        d="M15.333 6.667l-3.066-2.934A7.2 7.2 0 0010 2.333 6.067 6.067 0 002.333 6m11.334 4a7.198 7.198 0 01-1.4 2.267 6.067 6.067 0 01-8.534 0L.667 9.333"
        stroke="#141414"
      />
    </Svg>
  );
}
