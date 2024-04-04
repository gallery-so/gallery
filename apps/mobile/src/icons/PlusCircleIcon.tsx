import Svg, { Path, SvgProps } from 'react-native-svg';

export function PlusCircleIcon(props: SvgProps) {
  return (
    <Svg width={20} height={20} fill="none" {...props}>
      <Path
        stroke="#FEFEFE"
        strokeMiterlimit={10}
        strokeWidth={1.25}
        d="M10 6.664v6.667M13.333 10H6.666"
      />
      <Path
        stroke="#FEFEFE"
        strokeWidth={1.25}
        d="M10 18.33a8.333 8.333 0 1 0 0-16.666 8.333 8.333 0 0 0 0 16.667Z"
      />
    </Svg>
  );
}
