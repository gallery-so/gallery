import Svg, { Path,SvgProps } from 'react-native-svg';
export function ListIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke="#707070" strokeMiterlimit={10} d="M5.333 4H14M5.333 8H14M5.333 12H14" />
      <Path stroke="#707070" d="M2 4h1M2 8h1M2 12h1" />
    </Svg>
  );
}
