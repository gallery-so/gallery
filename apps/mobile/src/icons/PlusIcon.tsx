import Svg, { Path, SvgProps } from 'react-native-svg';
export function PlusIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path stroke="#0022F0" strokeMiterlimit={10} strokeWidth={1.6} d="M12 0v24M24 12H0" />
    </Svg>
  );
}
