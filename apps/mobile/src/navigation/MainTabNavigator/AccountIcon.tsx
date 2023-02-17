import Svg, { G, Path, SvgProps } from "react-native-svg";

export const AccountIcon = (props: SvgProps) => (
  <Svg width={25} height={24} fill="none" {...props}>
    <G stroke="#000">
      <Path d="M12.5 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21v-4l3-3 4.5 1.5L17 14l3 3v4" />
    </G>
  </Svg>
);
