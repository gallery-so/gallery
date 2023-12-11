import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

export function InfoCircleIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <G stroke="#000" clipPath="url(#a)">
        <Path d="M8 14.667A6.667 6.667 0 1 0 8 1.334a6.667 6.667 0 0 0 0 13.333ZM8 11.666v-4M8 5v1" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h16v16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
