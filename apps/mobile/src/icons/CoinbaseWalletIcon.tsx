import Svg, { ClipPath, Defs, G, Path, Rect,SvgProps } from 'react-native-svg';

export function CoinbaseWalletIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path fill="#0052FF" d="M24 0H0v24h24V0Z" />
        <Path
          fill="#fff"
          fillRule="evenodd"
          d="M3.563 12a8.437 8.437 0 1 0 16.874 0 8.437 8.437 0 0 0-16.875 0Zm6.28-2.719a.563.563 0 0 0-.562.563v4.312c0 .31.252.563.563.563h4.312c.31 0 .563-.252.563-.563V9.844a.563.563 0 0 0-.563-.563H9.844Z"
          clipRule="evenodd"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Rect width={24} height={24} fill="#fff" rx={12} />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
