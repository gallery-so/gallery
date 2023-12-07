import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function ProhibitionIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
        d="M0-.002v7.03l7.03-7.03H0ZM24-.002v7.03l-7.03-7.03H24ZM12 4.968l4.97-4.97H7.03L12 4.968ZM0 23.998v-7.03l7.03 7.03H0ZM24 23.998v-7.03l-7.03 7.03H24ZM12 19.027l4.97 4.97H7.03l4.97-4.97ZM4.97 11.998 0 16.968v-9.94l4.97 4.97ZM19.03 11.998l4.97 4.97v-9.94l-4.97 4.97Z"
      />
    </Svg>
  );
}
