import Svg, { Path, SvgProps } from 'react-native-svg';

export function DarkModeIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M11 10.333a5.333 5.333 0 01-3.933-8.926 6.667 6.667 0 107.527 7.526 5.333 5.333 0 01-3.594 1.4z"
        stroke="#000"
        strokeLinejoin="bevel"
      />
    </Svg>
  );
}
