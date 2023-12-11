import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  stroke?: string;
} & SvgProps;

export default function CopyIcon({ stroke = '#141414', ...props }: Props) {
  return (
    <Svg width="25" height="24" viewBox="0 0 25 24" fill="none" {...props}>
      <Path d="M4.5 11.5L10.5 17.5L21.5 6.5" stroke={stroke} strokeMiterlimit="10" />
    </Svg>
  );
}
