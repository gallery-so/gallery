import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

export function WorldIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <G clipPath="url(#clip0_794_25754)" stroke="#141414">
        <Path d="M8 14.667A6.667 6.667 0 108 1.333a6.667 6.667 0 000 13.334z" />
        <Path d="M8 14.667c1.473 0 2.667-2.985 2.667-6.667S9.473 1.333 8 1.333C6.527 1.333 5.333 4.318 5.333 8S6.527 14.667 8 14.667zM1.333 8h13.334" />
        <Path d="M13.333 12A12.868 12.868 0 008 11a12.868 12.868 0 00-5.333 1M2.667 4A12.867 12.867 0 008 5c1.828.05 3.647-.291 5.333-1" />
      </G>
      <Defs>
        <ClipPath id="clip0_794_25754">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
