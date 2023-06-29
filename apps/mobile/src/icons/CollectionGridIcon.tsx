import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function CollectionGridIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M10 3.4H3.4v6.61H10V3.4zM20.5 3.4h-6.6v6.61h6.6V3.4zM10 13.9H3.4v6.61H10V13.9zM20.5 13.9h-6.6v6.61h6.6V13.9z"
        stroke={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
      />
    </Svg>
  );
}
