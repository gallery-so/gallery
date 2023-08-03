import Svg, { G, Path, SvgProps } from 'react-native-svg';

type Props = {
  color: string;
  size?: number;
} & SvgProps;

export const PostIcon = ({ color, size = 24, ...props }: Props) => {
  const height = size;
  const originalHeight = 24;
  const scale = height / originalHeight;
  const width = height;

  return (
    <Svg width={width} height={width} fill="none" viewBox={`0 0 ${width} ${width}`} {...props}>
      <G transform={`scale(${scale})`}>
        <Path
          stroke={color}
          strokeMiterlimit={10}
          d="M.5 21.333V.5h23v23H.5v-2.167ZM12 6.666v10.667M17.333 12H6.667"
        />
      </G>
    </Svg>
  );
};
