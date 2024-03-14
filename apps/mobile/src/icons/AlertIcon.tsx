import Svg, { Path, SvgProps } from 'react-native-svg';
export function AlertIcon(props: SvgProps) {
  return (
    <Svg
      width={props.width || 16}
      height={props.height || 16}
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      <Path d="M20 15.833V24.9997" stroke="black" stroke-width="2" />
      <Path d="M20 29.1667V27.5" stroke="black" stroke-width="2" />
      <Path
        d="M20.0002 5L36.6668 33.3333H3.3335L20.0002 5Z"
        stroke={props.color ?? '#F00000'}
        stroke-width="2"
      />
    </Svg>
  );
}
