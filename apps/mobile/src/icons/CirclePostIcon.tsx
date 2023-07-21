import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  color: string;
  size?: number;
} & SvgProps;

export const CirclePostIcon = ({ color, size = 32, ...props }: Props) => {
  return (
    <Svg width={size} height={size} fill="none" {...props}>
      <Path stroke={color} strokeMiterlimit={10} d="M12 8.272v8M16 12.273H8" />
      <Path
        stroke={color}
        d="M12 22.273c5.523 0 10-4.478 10-10 0-5.523-4.477-10-10-10s-10 4.477-10 10c0 5.522 4.477 10 10 10Z"
      />
    </Svg>
  );
};
