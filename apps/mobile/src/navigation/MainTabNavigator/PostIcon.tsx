import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  color: string;
  size?: number;
} & SvgProps;

export const PostIcon = ({ color, size = 32, ...props }: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        stroke={color}
        strokeMiterlimit={10}
        d="M4.5 25.333V4.5h23v23h-23v-2.167ZM16 10.666v10.667M21.333 16H10.667"
      />
    </Svg>
  );
};
