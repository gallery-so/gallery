import { useColorScheme } from 'nativewind';
import Svg, { G, Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export const ExternalLinkIcon = (props: SvgProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={16} height={16} viewBox={'0 0 14 14'} fill="none">
      <G id="Icon">
        <Path
          d="M5.25 2.9165H11.0833V8.74984"
          stroke={colorScheme === 'dark' ? colors.white : colors.black['800']}
          stroke-miterlimit={10}
        />
        <Path
          d="M11.0833 2.9165L3.5 10.4998"
          stroke={colorScheme === 'dark' ? colors.white : colors.black['800']}
          stroke-miterlimit={10}
        />
      </G>
    </Svg>
  );
};
