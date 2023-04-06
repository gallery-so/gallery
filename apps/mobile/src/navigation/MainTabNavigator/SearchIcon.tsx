import Svg, { Path, SvgProps } from 'react-native-svg';

export const SearchIcon = (props: SvgProps) => (
  <Svg width={18} height={17} fill="none" {...props}>
    <Path d="M7.5 13.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM16.9 16.5 12 11.7" stroke="#000" />
  </Svg>
);
