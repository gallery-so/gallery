import Svg, { Path,SvgProps } from 'react-native-svg';

export function GridIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke="#141414" strokeMiterlimit={10} d="M10 2v12M6 2v12" />
      <Path stroke="#141414" d="M14 2H2v12h12V2Z" />
      <Path stroke="#141414" strokeMiterlimit={10} d="M14 10H2M14 6H2" />
    </Svg>
  );
}
