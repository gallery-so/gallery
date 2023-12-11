import Svg, { Path, SvgProps } from 'react-native-svg';
export function AlertIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke="#F00000" d="M8 6.333V10M8 11.667V11M8 2l6.667 11.333H1.334L8.001 2Z" />
    </Svg>
  );
}
