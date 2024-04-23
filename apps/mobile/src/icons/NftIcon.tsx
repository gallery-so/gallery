import Svg, { Path, SvgProps } from 'react-native-svg';
export function NftIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path stroke="#141414" strokeMiterlimit={2} d="M7 9v6L3 9v6" />
      <Path
        stroke="#141414"
        strokeMiterlimit={10}
        d="M14 9.5h-3V15M14 12h-3M21.5 9.5h-2.25m0 0V15m0-5.5h-2.5"
      />
      <Path stroke="#141414" d="M4 18a10 10 0 0 0 16 .07M20 6a10 10 0 0 0-15.95-.07" />
    </Svg>
  );
}
