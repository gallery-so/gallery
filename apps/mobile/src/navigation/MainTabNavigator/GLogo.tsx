import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export const GLogo = (props: SvgProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={13} height={16} fill="none" {...props}>
      <Path
        d="M11.303 10.292c0-1.482.225-1.863 1.101-1.93v-.808H6.119v.807c2.132.09 3.256-.162 3.256 1.685l.006 2.95a3.814 3.814 0 0 1-.476 1.05c-.46.674-1.224.988-2.256.988-2.444 0-3.89-2.58-3.89-7.024S4.092.923 6.761.923c2.065 0 3.308 1.363 3.624 4.235h.92V.286h-.875c-.112.56-.203.718-.405.718C9.667 1.004 8.67 0 6.674 0 2.927 0 .458 3.36.458 8.094c0 4.779 2.36 7.875 6.236 7.875H6.7c2.287 0 3.016-1.525 3.172-2.011l.548 1.81h.876l.006-5.476Z"
        fill={colorScheme === 'dark' ? colors.white : colors.offBlack}
      />
    </Svg>
  );
};
