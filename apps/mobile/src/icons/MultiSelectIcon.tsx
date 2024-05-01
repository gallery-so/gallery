import Svg, { Path, SvgProps } from 'react-native-svg';

export function MultiSelectIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path stroke="#000" d="M13.667 2.332H5v8.667h8.667V2.332Z" />
      <Path stroke="#000" d="M11 11v2.667H2.334V5H5" />
    </Svg>
  );
}
