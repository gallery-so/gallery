import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export function EditPencilIcon(props: SvgProps) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none" {...props}>
      <Path
        d="M2 10l.444-2 6-6h.445L10 3.111v.445l-6 6L2 10zM7.556 2.667l1.777 1.777"
        stroke="#141414"
        strokeMiterlimit={10}
      />
    </Svg>
  );
}
