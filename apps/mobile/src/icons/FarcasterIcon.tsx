import { useColorScheme } from 'nativewind';
import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  fill?: string;
} & SvgProps;

export default function FarcasterIcon({ fill, ...props }: Props) {
  const { colorScheme } = useColorScheme();
  const strokeColor = fill ? fill : colorScheme === 'dark' ? colors.white : colors.black['800'];

  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <G clip-path="url(#clip0_501_4356)">
        <Path
          d="M15.4666 14.2859C15.7613 14.2859 16 14.5203 16 14.8097V15.3335H10.6666V14.8097C10.6666 14.5203 10.9053 14.2859 11.2 14.2859H15.4666Z"
          fill={strokeColor}
        />
        <Path
          d="M15.4666 14.2857V13.7619C15.4666 13.4724 15.228 13.238 14.9333 13.238H11.7333C11.4386 13.238 11.2 13.4724 11.2 13.7619V14.2857H15.4666Z"
          fill={strokeColor}
        />
        <Path d="M13.3333 0.666748H2.66663V2.76199H13.3333V0.666748Z" fill={strokeColor} />
        <Path d="M15.4667 4.8572H0.533333L0 2.76196H16L15.4667 4.8572Z" fill={strokeColor} />
        <Path d="M14.9333 4.85718H11.7333V13.2381H14.9333V4.85718Z" fill={strokeColor} />
        <Path
          d="M4.8 14.2859C5.09467 14.2859 5.33333 14.5203 5.33333 14.8097V15.3335H0V14.8097C0 14.5203 0.238667 14.2859 0.533333 14.2859H4.8Z"
          fill={strokeColor}
        />
        <Path
          d="M4.79999 14.2857V13.7619C4.79999 13.4724 4.56133 13.238 4.26666 13.238H1.06666C0.771992 13.238 0.533326 13.4724 0.533326 13.7619L0.533325 14.2857H4.79999Z"
          fill={strokeColor}
        />
        <Path d="M4.26665 4.85718H1.06665V13.2381H4.26665V4.85718Z" fill={strokeColor} />
        <Path
          d="M4.2666 9.00577C4.2666 6.9807 5.93807 5.33908 7.99993 5.33908C10.0618 5.33908 11.7333 6.9807 11.7333 9.00577V4.85718H4.2666V9.00577Z"
          fill={strokeColor}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_501_4356">
          <Rect width="16" height="16" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
