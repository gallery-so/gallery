import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';
export function DragIcon(props: SvgProps) {
  return (
    <Svg width={20} height={20} fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path
          fill="#FEFEFE"
          d="M9.167 14.999c0 .916-.75 1.666-1.667 1.666S5.833 15.915 5.833 15c0-.917.75-1.667 1.667-1.667s1.667.75 1.667 1.667ZM7.5 8.332c-.917 0-1.667.75-1.667 1.667 0 .916.75 1.666 1.667 1.666s1.667-.75 1.667-1.666c0-.917-.75-1.667-1.667-1.667Zm0-5c-.917 0-1.667.75-1.667 1.667 0 .916.75 1.666 1.667 1.666S9.167 5.915 9.167 5c0-.917-.75-1.667-1.667-1.667Zm5 3.333c.917 0 1.667-.75 1.667-1.666 0-.917-.75-1.667-1.667-1.667s-1.667.75-1.667 1.667c0 .916.75 1.666 1.667 1.666Zm0 1.667c-.917 0-1.667.75-1.667 1.667 0 .916.75 1.666 1.667 1.666s1.667-.75 1.667-1.666c0-.917-.75-1.667-1.667-1.667Zm0 5c-.917 0-1.667.75-1.667 1.667 0 .916.75 1.666 1.667 1.666s1.667-.75 1.667-1.666c0-.917-.75-1.667-1.667-1.667Z"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h20v20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
