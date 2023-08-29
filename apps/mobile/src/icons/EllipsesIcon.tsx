import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function EllipsesIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={25} height={24} fill="none" {...props}>
      <Path
        stroke={colorScheme === 'dark' ? colors.white : colors.black['800']}
        strokeMiterlimit={10}
        d="M14.5 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM22.5 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM6.5 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"
      />
    </Svg>
  );
}
