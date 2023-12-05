import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

export function InfoCircleIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <G stroke="#9E9E9E" strokeWidth={2} clipPath="url(#a)">
        <Path d="M8 14.666A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.333ZM8 10.333V7M8 5.333V6" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h16v16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
