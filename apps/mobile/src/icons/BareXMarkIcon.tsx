import Svg, { Path } from 'react-native-svg';

import colors from '~/shared/theme/colors';

// TODO: Merge this with the XMarkIcon in future to support different color in dark/light mode and hard coded size color

export function BareXMarkIcon() {
  return (
    <Svg width={6} height={6} fill="none">
      <Path
        stroke={colors.black['800']}
        strokeMiterlimit={10}
        strokeWidth={0.5}
        d="M5.333.667.667 5.333M.667.667l4.666 4.666"
      />
    </Svg>
  );
}
