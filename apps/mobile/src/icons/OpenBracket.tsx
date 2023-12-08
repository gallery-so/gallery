import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export default function OpenBracket(props: SvgProps) {
  return (
    <Svg width="18" height="60" viewBox="0 0 18 60" fill="none" {...props}>
      <Path
        d="M16.6419 59.5469C-3.59184 47.3843 -5.35442 18.1143 13.0529 3.43549C13.4717 3.1085 14.3609 2.43856 14.8016 2.13151C15.2422 1.82445 16.1754 1.22429 16.634 0.953125L17.6309 2.5223C-1.93689 15.6619 -1.9329 44.8441 17.6309 57.9777L16.634 59.5469H16.6419Z"
        fill="#141414"
      />
    </Svg>
  );
}
