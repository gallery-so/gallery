import { useColorScheme } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export const NotificationsIcon = (props: SvgProps) => {
  const colorScheme = useColorScheme();

  const strokeColor = colorScheme === 'dark' ? colors.white : colors.offBlack;
  const fillColor = colorScheme === 'light' ? colors.white : colors.offBlack;

  return (
    <Svg width={25} height={24} fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path
          d="m21.5 15.188-3-3.9V6.411L15.5 3h-6l-3 3.412v4.875l-3 3.9v2.438h18v-2.438Z"
          stroke={strokeColor}
        />
        <Path d="M14.75 18.75a2.25 2.25 0 0 1-4.5 0" stroke={strokeColor} strokeLinejoin="bevel" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill={fillColor} transform="translate(.5)" d="M0 0h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
