import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  color?: string;
} & SvgProps;

export function TopRightArrowIcon({ color, ...props }: Props) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke={color} strokeMiterlimit={10} d="M6 3.333h6.667V10M12.667 3.333 4 12" />
    </Svg>
  );
}
