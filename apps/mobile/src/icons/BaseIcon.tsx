import Svg, { Path, SvgProps } from 'react-native-svg';

export function BaseIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path fill="#FEFEFE" d="M0 0h16v16H0z" />
      <Path fill="#0052FF" d="M8 13.996a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
      <Path
        fill="#fff"
        d="M8.027 12.166a4.207 4.207 0 0 0 4.21-4.204 4.207 4.207 0 0 0-4.21-4.203 4.208 4.208 0 0 0-4.196 3.85h5.565v.707H3.831a4.208 4.208 0 0 0 4.196 3.85Z"
      />
    </Svg>
  );
}
