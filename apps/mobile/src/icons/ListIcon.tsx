import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  color?: string;
} & SvgProps;

export function ListIcon({ color = '#707070', ...props }: Props) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke={color} strokeMiterlimit={10} d="M5.333 4H14M5.333 8H14M5.333 12H14" />
      <Path stroke={color} d="M2 4h1M2 8h1M2 12h1" />
    </Svg>
  );
}
