import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export default function CloseBracket(props: SvgProps) {
  return (
    <Svg width="18" height="60" viewBox="0 0 18 60" fill="none" {...props}>
      <Path
        d="M1.40305 0.953125C21.6348 13.1257 23.3994 42.3857 4.99201 57.0645C4.5733 57.3935 3.68408 58.0615 3.24344 58.3705C2.80279 58.6796 1.86963 59.2757 1.40904 59.5469L0.412109 57.9777C19.9819 44.8381 19.9779 15.6559 0.412109 2.5223L1.40904 0.953125H1.40305Z"
        fill="#141414"
      />
    </Svg>
  );
}
