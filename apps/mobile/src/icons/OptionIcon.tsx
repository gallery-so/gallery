import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function OptionIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path
        stroke={colorScheme === 'dark' ? colors.offWhite : colors.black[800]}
        strokeMiterlimit={10}
        d="M9.333 8a1.333 1.333 0 1 0-2.666 0 1.333 1.333 0 0 0 2.666 0ZM14.667 8A1.333 1.333 0 1 0 12 8a1.333 1.333 0 0 0 2.667 0ZM4 8a1.333 1.333 0 1 0-2.667 0A1.333 1.333 0 0 0 4 8Z"
      />
    </Svg>
  );
}
