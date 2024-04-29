import Svg, { Path, SvgProps } from 'react-native-svg';

export function ArrowUpIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path stroke="#0022F0" strokeMiterlimit={10} strokeWidth={1.6} d="m19 10-7-7-7 7M12 3v19" />
    </Svg>
  );
}
