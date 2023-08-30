import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  color: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
} & SvgProps;

export const PostIcon = ({ color, height = 24, width = 24, ...props }: Props) => {
  return (
    <Svg fill="none" width={width} height={height} viewBox="0 0 30 30" {...props}>
      <Path
        stroke={color}
        strokeMiterlimit={10}
        strokeWidth={2}
        d="M4.5 25.333V4.5h23v23h-23v-2.167ZM16 10.666v10.667M21.333 16H10.667"
      />
    </Svg>
  );
};
