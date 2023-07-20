import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export const PostIcon = (props: SvgProps) => {
  const { colorScheme } = useColorScheme();
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        stroke={colorScheme === 'dark' ? colors.white : colors.black['800']}
        strokeMiterlimit={10}
        d="M.5 21.333V.5h23v23H.5v-2.167ZM12 6.666v10.667M17.333 12H6.667"
      />
    </Svg>
  );
};
