import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  active?: boolean;
} & SvgProps;

export function AdmireIcon({ active = false, ...props }: Props) {
  return (
    <Svg
      width={19}
      height={18}
      fill="none"
      {...props}
      className={active ? 'text-activeBlue' : 'text-offBlack'}
    >
      <Path
        stroke="currentColor"
        d="M9 5a5 5 0 0 1 5 5M14 10a5 5 0 0 1 5-5M19 5a5 5 0 0 1-5-5M14 0a5 5 0 0 1-5 5M0 14a4 4 0 0 1 4 4M4 18a4 4 0 0 1 4-4M8 14a4 4 0 0 1-4-4M4 10a4 4 0 0 1-4 4M3 1v5M.5 3.5h5M15 13v5M12.5 15.5h5"
      />
    </Svg>
  );
}
