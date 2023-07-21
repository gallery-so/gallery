import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  color: string;
  size?: number;
} & SvgProps;

export const PostIcon = ({ color, size = 24, ...props }: Props) => {
  return (
    <Svg width={size} height={size} fill="none" {...props}>
      <Path
        // stroke={colorScheme === 'dark' ? colors.white : colors.black['800']}
        stroke={color}
        strokeMiterlimit={10}
        d="M.5 21.333V.5h23v23H.5v-2.167ZM12 6.666v10.667M17.333 12H6.667"
      />
    </Svg>
  );
};
