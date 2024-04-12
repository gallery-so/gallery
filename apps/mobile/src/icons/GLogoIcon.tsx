import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  height?: number;
  width?: number;
  invertColor?: boolean;
};

const originalWidth = 25;
const originalHeight = 33;

export function GLogoIcon({
  width = originalWidth,
  height = originalHeight,
  invertColor = false,
}: Props) {
  const { colorScheme } = useColorScheme();

  const scaledWidth = (height * originalWidth) / originalHeight;
  const scaledHeight = (width * originalHeight) / originalWidth;

  const fill = React.useMemo(() => {
    if (invertColor) {
      return colorScheme === 'dark' ? colors.black['800'] : colors.white;
    }
    return colorScheme === 'dark' ? colors.white : colors.black['800'];
  }, [colorScheme, invertColor]);

  return (
    <Svg width={scaledWidth} height={scaledHeight} viewBox="0 0 25 33" fill="none">
      <Path
        d="M22.2 20.672c0-2.976.452-3.743 2.21-3.878v-1.622H11.787v1.622c4.282.181 6.539-.327 6.539 3.385l.013 5.924a7.662 7.662 0 01-.956 2.11c-.926 1.353-2.46 1.983-4.531 1.983-4.909 0-7.813-5.183-7.813-14.108S7.715 1.853 13.077 1.853c4.147 0 6.643 2.739 7.278 8.507h1.848V.574h-1.758c-.225 1.127-.407 1.442-.813 1.442-.719 0-2.721-2.016-6.731-2.016C5.376 0 .416 6.748.416 16.257c0 9.599 4.74 15.818 12.526 15.818h.015c4.592 0 6.058-3.064 6.369-4.04l1.102 3.635h1.758l.014-10.998z"
        fill={fill}
      />
    </Svg>
  );
}
