import Svg, { Path, SvgProps } from 'react-native-svg';

export function CloseIcon({ ...props }: SvgProps) {
  return (
    <Svg width="18" height="18" fill="none" viewBox="0 0 16 16" {...props}>
      <Path d="M12.6663 3.33398L3.33301 12.6673" stroke="#F9F9F9" stroke-miterlimit="10" />
      <Path d="M3.33301 3.33398L12.6663 12.6673" stroke="#F9F9F9" stroke-miterlimit="10" />
    </Svg>
  );
}
