import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  active?: boolean;
  style?: SvgProps['style'];
  height?: number;
} & SvgProps;

export function AdmireIcon({ active = false, style, height = 18, ...props }: Props) {
  const originalHeight = 18;
  const scale = height / originalHeight;

  return (
    <Svg
      width={19 * scale}
      height={height}
      fill="none"
      {...props}
      style={style}
      className={active ? 'text-activeBlue' : 'text-offBlack'}
    >
      <Path
        stroke="currentColor"
        d="M9 5a5 5 0 0 1 5 5M14 10a5 5 0 0 1 5-5M19 5a5 5 0 0 1-5-5M14 0a5 5 0 0 1-5 5M0 14a4 4 0 0 1 4 4M4 18a4 4 0 0 1 4-4M8 14a4 4 0 0 1-4-4M4 10a4 4 0 0 1-4 4M3 1v5M.5 3.5h5M15 13v5M12.5 15.5h5"
        transform={`scale(${scale})`}
      />
    </Svg>
  );
}
