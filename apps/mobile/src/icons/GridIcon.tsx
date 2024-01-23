import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  color?: string;
} & SvgProps;

export function GridIcon({ color = '#141414', ...props }: Props) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke={color} strokeMiterlimit={10} d="M10 2v12M6 2v12" />
      <Path stroke={color} d="M14 2H2v12h12V2Z" />
      <Path stroke={color} strokeMiterlimit={10} d="M14 10H2M14 6H2" />
    </Svg>
  );
}
