import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

export function LightModeIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <G clipPath="url(#clip0_409_921)" stroke="#FEFEFE">
        <Path d="M8 .333V3M15.667 8H13M.333 8H3M13.42 2.58l-1.847 1.847M2.58 2.58l1.847 1.847M8 15.667V13M2.58 13.42l1.847-1.847M13.42 13.42l-1.847-1.847M8 10.667a2.667 2.667 0 100-5.333 2.667 2.667 0 000 5.333z" />
      </G>
      <Defs>
        <ClipPath id="clip0_409_921">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
