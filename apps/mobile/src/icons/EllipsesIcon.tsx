import Svg, { Path,SvgProps } from 'react-native-svg';

export function EllipsesIcon(props: SvgProps) {
  return (
    <Svg width={25} height={24} fill="none" {...props}>
      <Path
        stroke="#141414"
        strokeMiterlimit={10}
        d="M14.5 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM22.5 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM6.5 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"
      />
    </Svg>
  );
}
