import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  color?: string;
} & SvgProps;

export function TrashIcon({ color = '#F00000', ...props }: Props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M3 7h18M18.5 7l-1 14h-11l-1-14M8 7l.5-3.5h7L16 7" stroke={color} />
    </Svg>
  );
}
