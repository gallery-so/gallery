import Svg, { Path, SvgProps } from 'react-native-svg';

export function EmailIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path stroke="#000" strokeMiterlimit={10} d="M21.5 5h-19v14h19V5Z" />
      <Path stroke="#000" strokeMiterlimit={10} d="m2.5 5 9.5 7 9.5-7" />
    </Svg>
  );
}
