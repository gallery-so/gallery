import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  size?: number;
} & SvgProps;

export function EnsembleIcon({ size = 24, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg
      data-name="Layer 2"
      viewBox="0 0 1073.71 624.85"
      width={size}
      height={size}
      fill={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
      {...props}
    >
      <Path
        d="M0 0h1050.82v128.48h-790.3v115.31h717.24v126.73H260.52v125.86h813.19v128.48H0V0Z"
        data-name="Layer 1"
        strokeWidth={0}
      />
    </Svg>
  );
}
