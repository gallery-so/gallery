import Svg, { Path, SvgProps } from 'react-native-svg';

export function CheckIcon(props: SvgProps) {
  return (
    <Svg width={16} height={15} fill="none" {...props}>
      <Path stroke="#FEFEFE" strokeMiterlimit={10} strokeWidth={0.9} d="m5.6 7 1.8 1.8 3-3" />
    </Svg>
  );
}
